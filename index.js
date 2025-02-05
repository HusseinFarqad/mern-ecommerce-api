import express from "express";
import cors from "cors";
import "dotenv/config";
import connectCloudinary from "./config/cloudinary.js";
import connectDB from "./config/mongodb.js";
import userRouter from "./routes/userRoute.js";
import productRouter from "./routes/productRoute.js";
import cartRouter from "./routes/cartRoute.js";

// App Config
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const port = process.env.PORT || 4000;
connectDB();
connectCloudinary();

// api endpoints
app.use("/api/user", userRouter);
app.use("/api/product", productRouter);
app.use("/api/cart", cartRouter);

app.get("/", (req, res) => {
  res.send("Server is Working");
});

app.listen(port, () => console.log("Server started on PORT : " + port));
