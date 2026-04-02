import express from "express";
import productRouter from "./routes/products.js";
import redis from "./redis.js";

const app = express();

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.set('json spaces', 2); // 👈 THIS LINE

app.use("/api/", productRouter);



app.listen(3000, () => {
  console.log("Server is running on port 3000");
}); 

