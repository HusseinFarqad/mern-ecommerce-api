import express from "express";
import upload from "../middleware/multer.js";
import {
  addProduct,
  getAllProducts,
  getProduct,
  deleteProduct,
  updateProduct,
} from "../controllers/productController.js";
import { errorHandler } from "../middleware/errorHandler.js";
import adminAuth from "../middleware/adminAuth.js";

const productRouter = express.Router();

// Public routes
productRouter.get("/products", getAllProducts);
productRouter.get("/:id", getProduct);

// Protected routes (admin only)
productRouter.post(
  "/add",
  //   adminAuth,
  upload.fields([
    { name: "image1", maxCount: 1 },
    { name: "image2", maxCount: 1 },
    { name: "image3", maxCount: 1 },
    { name: "image4", maxCount: 1 },
  ]),
  addProduct
);

productRouter.put(
  "/:id",
  adminAuth,
  upload.fields([
    { name: "image1", maxCount: 1 },
    { name: "image2", maxCount: 1 },
    { name: "image3", maxCount: 1 },
    { name: "image4", maxCount: 1 },
  ]),
  updateProduct
);

productRouter.delete("/:id", adminAuth, deleteProduct);

productRouter.use(errorHandler);

export default productRouter;
