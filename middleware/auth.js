import jwt from "jsonwebtoken";
import { AppError } from "../utils/AppError.js";

const authUser = async (req, res, next) => {
  try {
    const { token } = req.headers;

    if (!token) {
      throw new AppError("Not Authorized - Please login again", 401);
    }

    // Verify token and set user info
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Set the entire decoded token info
    req.user = decoded;

    // Also set userId directly on req.body for backward compatibility
    req.body.userId = decoded.id;

    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      next(new AppError("Invalid token - Please login again", 401));
    } else if (error.name === "TokenExpiredError") {
      next(new AppError("Token expired - Please login again", 401));
    } else {
      next(error);
    }
  }
};

export default authUser;
