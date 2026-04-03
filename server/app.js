import express from "express";
import cookieParser from "cookie-parser";
import corsMiddleware from "./cors.js";
import productRouter from "./routes/products.js";
import authRouter from "./routes/auth.js";
import rateLimitingProducts from "./middlewares/rateLimitingProducts.js";
import connectDB from "./db.js";

const app = express();

app.use(corsMiddleware);
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use(express.json());

app.use("/api/auth", authRouter);
app.use(rateLimitingProducts());
app.use("/api/", productRouter);



app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});

connectDB();

