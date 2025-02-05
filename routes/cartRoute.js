import express from "express";
import {
  addToCart,
  getUserCart,
  updateCart,
  clearCart,
} from "../controllers/cartController.js";
import authUser from "../middleware/auth.js";
import { validateCartInput } from "../validators/cartValidator.js";

const cartRouter = express.Router();

cartRouter.use(authUser);

cartRouter.post("/add", validateCartInput, addToCart);
cartRouter.put("/update", validateCartInput, updateCart);
cartRouter.get("/", getUserCart);
cartRouter.delete("/clear", clearCart);

export default cartRouter;
