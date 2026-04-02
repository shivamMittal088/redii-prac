import express from "express";

const productRouter = express.Router();

productRouter.get("/products", (req, res) => {
  setTimeout(() => {
    res.json({
      products: [
        { id: 1, name: "Product 1", price: 10.99 },
        { id: 2, name: "Product 2", price: 19.99 },
        { id: 3, name: "Product 3", price: 5.99 },
        { id: 4, name: "Product 4", price: 12.99 },
        { id: 5, name: "Product 5", price: 8.99 }
      ]
    });
  }, 1000);
});

export default productRouter;