import userModel from "../models/userModel.js";
import Product from "../models/productModel.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

// Add to cart
const addToCart = asyncHandler(async (req, res) => {
  const { itemId, size } = req.body;
  const userId = req.user.id; // Set by auth middleware

  // Validate product existence and size availability
  const product = await Product.findById(itemId);
  if (!product) {
    throw new AppError("Product not found", 404);
  }

  if (size && !product.sizes.includes(size)) {
    throw new AppError("Selected size is not available", 400);
  }

  // Get user and cart data
  const user = await userModel.findById(userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  let cartData = user.cartData || {};

  // Update cart
  if (cartData[itemId]) {
    if (cartData[itemId][size]) {
      cartData[itemId][size] += 1;
    } else {
      cartData[itemId][size] = 1;
    }
  } else {
    cartData[itemId] = {
      [size]: 1,
      productInfo: {
        name: product.name,
        price: product.price,
        image: product.image[0], // First image as thumbnail
      },
    };
  }

  // Update cart total
  const cartTotal = await calculateCartTotal(cartData);

  // Save changes
  await userModel.findByIdAndUpdate(
    userId,
    {
      cartData,
      cartTotal,
    },
    { new: true }
  );

  res.status(200).json({
    success: true,
    message: "Item added to cart",
    data: {
      cartData,
      cartTotal,
    },
  });
});

// update user cart
const updateCart = asyncHandler(async (req, res) => {
  const { itemId, size, quantity } = req.body;
  const userId = req.user.id;

  // Validate inputs
  if (!itemId || !size || quantity === undefined) {
    throw new AppError("Missing required fields", 400);
  }

  if (quantity < 0) {
    throw new AppError("Quantity cannot be negative", 400);
  }

  // Get user and validate product
  const [user, product] = await Promise.all([
    userModel.findById(userId),
    Product.findById(itemId),
  ]);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  if (!product.sizes.includes(size)) {
    throw new AppError("Invalid size selected", 400);
  }

  let cartData = user.cartData || {};

  // Remove item if quantity is 0
  if (quantity === 0) {
    if (cartData[itemId]) {
      delete cartData[itemId][size];
      // Remove product entirely if no sizes left
      if (
        Object.keys(cartData[itemId]).length === 1 &&
        cartData[itemId].productInfo
      ) {
        delete cartData[itemId];
      }
    }
  } else {
    // Update quantity
    if (!cartData[itemId]) {
      cartData[itemId] = {
        productInfo: {
          name: product.name,
          price: product.price,
          image: product.image[0],
        },
      };
    }
    cartData[itemId][size] = quantity;
  }

  // Calculate new cart total
  const cartTotal = await calculateCartTotal(cartData);

  // Save changes
  const updatedUser = await userModel.findByIdAndUpdate(
    userId,
    { cartData, cartTotal },
    { new: true }
  );

  res.status(200).json({
    success: true,
    message: "Cart updated successfully",
    data: {
      cartData: updatedUser.cartData,
      cartTotal: updatedUser.cartTotal,
    },
  });
});

// Get user cart data
const getUserCart = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const user = await userModel.findById(userId).select("cartData cartTotal");
  if (!user) {
    throw new AppError("User not found", 404);
  }

  // Get latest product information
  const cartData = user.cartData || {};
  const cartItems = [];

  for (const [itemId, itemData] of Object.entries(cartData)) {
    if (itemId === "productInfo") continue;

    const product = await Product.findById(itemId).select(
      "name price image stock"
    );
    if (product) {
      const sizes = Object.entries(itemData)
        .filter(([key]) => key !== "productInfo")
        .map(([size, quantity]) => ({
          size,
          quantity,
          subtotal: quantity * product.price,
        }));

      cartItems.push({
        productId: itemId,
        name: product.name,
        price: product.price,
        image: product.image[0],
        sizes,
        total: sizes.reduce((sum, item) => sum + item.subtotal, 0),
      });
    }
  }

  const cartTotal = await calculateCartTotal(cartData);

  res.status(200).json({
    success: true,
    data: {
      items: cartItems,
      total: cartTotal,
      itemCount: cartItems.reduce(
        (sum, item) =>
          sum +
          item.sizes.reduce((sizeSum, size) => sizeSum + size.quantity, 0),
        0
      ),
    },
  });
});

// Clear cart
const clearCart = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  await userModel.findByIdAndUpdate(userId, {
    cartData: {},
    cartTotal: 0,
  });

  res.status(200).json({
    success: true,
    message: "Cart cleared successfully",
  });
});

// Helper function to calculate cart total
const calculateCartTotal = async (cartData) => {
  let total = 0;

  for (const [itemId, itemData] of Object.entries(cartData)) {
    const product = await Product.findById(itemId);
    if (product) {
      Object.entries(itemData).forEach(([size, quantity]) => {
        if (size !== "productInfo") {
          total += product.price * quantity;
        }
      });
    }
  }

  return total;
};

export { addToCart, updateCart, getUserCart, clearCart };
