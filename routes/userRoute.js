import express from "express";
import {
  loginUser,
  registerUser,
  adminlogin,
} from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.get("/", (req, res) => {
  res.send("user route is working!");
});

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.post("/admin", adminlogin);

export default userRouter;
