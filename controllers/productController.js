import { v2 as cloudinary } from "cloudinary";
import Product from "../models/productModel.js";
import { validateProduct } from "../validators/productValidator.js";
import { uploadToCloudinary } from "../utils/cloudinaryHelper.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const addProduct = asyncHandler(async (req, res) => {
  // Validate input
  const validationResult = validateProduct(req.body);
  if (!validationResult.success) {
    throw new AppError(validationResult.message, 400);
  }

  const { name, description, price, category, subCategory, sizes, bestseller } =
    req.body;

  // Handle image processing
  const imageFields = ["image1", "image2", "image3", "image4"];
  const images = imageFields
    .map((field) => req.files[field]?.[0])
    .filter(Boolean);

  if (images.length === 0) {
    throw new AppError("At least one image is required", 400);
  }

  // Upload images to Cloudinary
  const imagesUrl = await Promise.all(
    images.map((image) => uploadToCloudinary(image.path))
  );

  const productData = {
    name: name.trim(),
    description: description.trim(),
    category: category.trim(),
    price: Number(price),
    subCategory: subCategory.trim(),
    bestseller: bestseller === "true",
    sizes: Array.isArray(sizes) ? sizes : JSON.parse(sizes || "[]"),
    image: imagesUrl,
    date: Date.now(),
  };

  console.log(productData);

  const newProduct = new Product(productData);
  await newProduct.save();

  res.status(201).json({
    success: true,
    message: "Product added successfully",
    data: newProduct,
  });
});

const getAllProducts = asyncHandler(async (req, res) => {
  const {
    category,
    subCategory,
    minPrice,
    maxPrice,
    bestseller,
    sort = "-date", // Default sort by newest
    limit = 20, // Default limit per page
    page = 1, // Default page number
  } = req.query;

  // Validate numeric inputs
  if (minPrice && isNaN(Number(minPrice))) {
    throw new AppError("Minimum price must be a number", 400);
  }
  if (maxPrice && isNaN(Number(maxPrice))) {
    throw new AppError("Maximum price must be a number", 400);
  }
  if (minPrice && maxPrice && Number(minPrice) > Number(maxPrice)) {
    throw new AppError(
      "Minimum price cannot be greater than maximum price",
      400
    );
  }

  // Build filter object
  const filter = {};
  if (category) filter.category = category;
  if (subCategory) filter.subCategory = subCategory;
  if (bestseller) filter.bestseller = bestseller === "true";
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  // Validate sort parameter
  const validSortFields = ["date", "price", "name"];
  const sortField = sort.startsWith("-") ? sort.slice(1) : sort;
  if (!validSortFields.includes(sortField)) {
    throw new AppError("Invalid sort parameter", 400);
  }

  // Calculate pagination
  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.min(50, Math.max(1, Number(limit))); // Max 50 items per page
  const skip = (pageNum - 1) * limitNum;

  // Execute query with pagination
  const products = await Product.find(filter)
    .sort(sort)
    .select("-__v")
    .limit(limitNum)
    .skip(skip);

  // Get total count for pagination
  const totalProducts = await Product.countDocuments(filter);

  // Check if no products found
  if (!products || products.length === 0) {
    return res.status(200).json({
      success: true,
      message: "No products found matching the criteria",
      count: 0,
      data: [],
      pagination: {
        currentPage: pageNum,
        totalPages: 0,
        totalItems: 0,
        hasMore: false,
      },
    });
  }

  // Return successful response with pagination info
  res.status(200).json({
    success: true,
    count: products.length,
    data: products,
    pagination: {
      currentPage: pageNum,
      totalPages: Math.ceil(totalProducts / limitNum),
      totalItems: totalProducts,
      hasMore: totalProducts > pageNum * limitNum,
    },
    filters: {
      applied: filter,
      sortBy: sort,
    },
  });
});

// Get single product by ID
const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).select("-__v");

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  res.status(200).json({
    success: true,
    data: product,
  });
});

// Delete product
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  // Delete images from Cloudinary
  // Extract public_id from Cloudinary URLs and delete them
  const imageIds = product.image.map((url) => {
    const parts = url.split("/");
    const filename = parts[parts.length - 1].split(".")[0];
    return filename;
  });

  try {
    await Promise.all(imageIds.map((id) => cloudinary.uploader.destroy(id)));
  } catch (error) {
    console.error("Error deleting images from Cloudinary:", error);
  }

  await product.deleteOne();

  res.status(200).json({
    success: true,
    message: "Product deleted successfully",
  });
});

// update product
const updateProduct = asyncHandler(async (req, res) => {
  let product = await Product.findById(req.params.id);

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  // Validate input if provided
  if (Object.keys(req.body).length > 0) {
    const validationResult = validateProduct(req.body, true); // true for partial validation
    if (!validationResult.success) {
      throw new AppError(validationResult.message, 400);
    }
  }

  const updateData = { ...req.body };

  // Handle new images if provided
  if (req.files && Object.keys(req.files).length > 0) {
    const imageFields = ["image1", "image2", "image3", "image4"];
    const newImages = imageFields
      .map((field) => req.files[field]?.[0])
      .filter(Boolean);

    if (newImages.length > 0) {
      // Upload new images to Cloudinary
      const newImagesUrl = await Promise.all(
        newImages.map((image) => uploadToCloudinary(image.path))
      );

      // Combine with existing images or replace completely based on your needs
      updateData.image = [...product.image, ...newImagesUrl].slice(0, 4); // Keep max 4 images
    }
  }

  // Process the data before update
  if (updateData.name) updateData.name = updateData.name.trim();
  if (updateData.description)
    updateData.description = updateData.description.trim();
  if (updateData.category) updateData.category = updateData.category.trim();
  if (updateData.subCategory)
    updateData.subCategory = updateData.subCategory.trim();
  if (updateData.price) updateData.price = Number(updateData.price);
  if (updateData.bestseller)
    updateData.bestseller = updateData.bestseller === "true";
  if (updateData.sizes) {
    updateData.sizes = Array.isArray(updateData.sizes)
      ? updateData.sizes
      : JSON.parse(updateData.sizes || "[]");
  }

  product = await Product.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    message: "Product updated successfully",
    data: product,
  });
});

export { addProduct, getAllProducts, getProduct, deleteProduct, updateProduct };
