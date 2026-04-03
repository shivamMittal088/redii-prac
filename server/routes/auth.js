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

    req.session.user = { id: user._id, email: user.email, name: user.name };

    await new Promise((resolve, reject) => {
      req.session.save((err) => { if (err) reject(err); else resolve(); });
    });

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
    console.error("Login error:", err.message, err.stack);
    return res.status(500).json({ 
        error: "Internal Server Error",
    });
  }
});


authRouter.post("/logout", authenticate, async (req, res) => {
    try {
        req.session.destroy((err) => {
            if (err) console.error("Session destroy error:", err);
        });
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

// GET /api/auth/sessions - list all active sessions (logged-in devices)
authRouter.get("/sessions", authenticate, async (req, res) => {
    try {
        const keys = await redis.keys("session:*");
        if (keys.length === 0) {
            return res.status(200).json({ sessions: [] });
        }

        const values = await redis.mget(...keys);
        const sessions = [];

        for (let i = 0; i < keys.length; i++) {
            if (!values[i]) continue;
            try {
                const data = JSON.parse(values[i]);
                if (data.user) {
                    // Extract session ID from key (strip "session:" prefix)
                    const sid = keys[i].replace(/^session:/, "");
                    sessions.push({
                        sid,
                        name: data.user.name,
                        email: data.user.email,
                        // Mark which session belongs to the current requester
                        isCurrent: req.session.id === sid,
                    });
                }
            } catch {
                // skip malformed session entries
            }
        }

        return res.status(200).json({ sessions });
    } catch (err) {
        console.error("Sessions list error:", err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

// Logout all users - deletes every session:* key in Redis
authRouter.post("/logout-all", authenticate, async (req, res) => {
    try {
        const keys = await redis.keys("session:*");
        if (keys.length > 0) {
            await redis.del(...keys);
        }
        res.cookie("token", "", {
            httpOnly: true,
            sameSite: "lax",
            expires: new Date(0),
        });
        return res.status(200).json({ message: `Logged out ${keys.length} session(s).` });
    } catch (err) {
        console.error("Logout-all error:", err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

export default authRouter;
