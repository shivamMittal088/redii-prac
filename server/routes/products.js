import express from "express";
import redis from "../redis.js";
import rateLimitingProducts from "../middlewares/rateLimitingProducts.js";

const productRouter = express.Router();

productRouter.get("/products", rateLimitingProducts(), async (req, res) => {
  console.log("Fetching products...");

  try {
    const exists = await redis.exists("products");

    if (exists) {
      console.log("Products found in cache");
      const cachedProducts = await redis.get("products");
      return res.json(JSON.parse(cachedProducts));
    }

    // Simulate DB fetch
    const data = {
      products: [
        { id: 1, name: "Product 1", price: 10.99 },
        { id: 2, name: "Product 2", price: 19.99 },
        { id: 3, name: "Product 3", price: 5.99 },
        { id: 4, name: "Product 4", price: 12.99 },
        { id: 5, name: "Product 5", price: 8.99 },
      ],
    };

    await redis.setex("products", 60, JSON.stringify(data));
    console.log("Products cached");

    return res.json(data);
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


productRouter.get("/products/:id" , rateLimitingProducts(), async(req,res)=>{
  const {id} = req.params;
  console.log(`Fetching product with id: ${id}...`);
  try{
    const exists = await redis.exists(`product:${id}`);

    if(exists){
      console.log(`Product ${id} found in cache`);
      const cachedProduct = await redis.get(`product:${id}`);
      return res.json(JSON.parse(cachedProduct));
    }

    // Simulate DB fetch
    const product = {
      id: parseInt(id),
      name: `Product ${id}`,
      price: (Math.random() * 20 + 5).toFixed(2),
    };

    await redis.setex(`product:${id}`, 60, JSON.stringify(product));
    console.log(`Product ${id} cached`);
    return res.json(product);
  } catch (err) {
    console.error(`Error fetching product ${id}:`, err);
    res.status(500).json({ error: "Internal Server Error" });


  }
})

export default productRouter;