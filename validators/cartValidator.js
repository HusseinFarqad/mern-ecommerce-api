export const validateCartInput = (req, res, next) => {
  const { itemId, size, quantity } = req.body;

  if (!itemId) {
    return res.status(400).json({
      success: false,
      message: "Product ID is required",
    });
  }

  if (req.method === "PUT" && quantity === undefined) {
    return res.status(400).json({
      success: false,
      message: "Quantity is required for updates",
    });
  }

  if (quantity && (isNaN(quantity) || quantity < 0)) {
    return res.status(400).json({
      success: false,
      message: "Invalid quantity",
    });
  }

  next();
};
