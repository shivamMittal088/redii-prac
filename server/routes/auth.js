import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/User.js";
import rateLimitingLogin from "../middlewares/rateLimitingLogin.js";
import authenticate from "../middlewares/authenticate.js";
import redis from "../redis.js";

dotenv.config();

const authRouter = express.Router();

// POST /api/auth/signup
authRouter.post("/signup", async (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    return res
      .status(400)
      .json({ 
        error: "name, email and password are required." 
      });
  }

  if (password.length < 6) {
    return res
      .status(400)
      .json({ error: "Password must be at least 6 characters." });
  }

  try {
    const exists = await User.findOne({ email });
    if (exists) {
      return res
        .status(409)
        .json({ error: "User with this email already exists." });
    }

    const hashedPassword = await bcrypt
    .hash(password, 12);

    await User.create({
         name, 
         email, 
         password: hashedPassword });

    return res.status(201).json({ 
        message: "User registered successfully." 
    });
  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({ 
        error: "Internal Server Error" 
    });
  }
});

// POST /api/auth/login
authRouter.post("/login", rateLimitingLogin(), async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ 
        error: "email and password are required." 
    });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ 
        error: "Invalid email or password." 
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      const key = req.loginRateLimitKey || `login:${req.ip}`;
      const attempts = await redis.incr(key);
      if (attempts === 1) {
        await redis.expire(key, process.env.REDIS_RATE_LIMIT_WINDOW);
      }
      return res.status(401).json({
        error: "Invalid email or password.",
        attempts,
      });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1d" },
    );

    await redis.del(req.loginRateLimitKey || `login:${req.ip}`);

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000, // 1 day in ms
    });

    return res.status(200).json({
      message: "Login successful.",
      token,
      user: { name: user.name, email: user.email },
    });
    } 
    catch (err) {
    console.error("Login error:", err);

    const attempts = await redis.get(req.ip) || 0;


    return res.status(500).json({ 
        error: "Internal Server Error" ,
        attempts,
    });
  }
});


authRouter.post("/logout", authenticate, async (req, res) => {
    try {
        res.cookie("token", "", {
            httpOnly: true,
            sameSite: "lax",
            expires: new Date(0),
        });
        return res.status(200).json({ message: "Logout successful." });
    } catch (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});



export default authRouter;
