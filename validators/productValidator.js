export const validateProduct = (data, isPartial = false) => {
  const { name, description, price, category, subCategory } = data;

  // For complete product validation
  if (!isPartial) {
    if (!name?.trim()) {
      return { success: false, message: "Product name is required" };
    }

    if (!description?.trim()) {
      return { success: false, message: "Product description is required" };
    }

    if (!price || isNaN(Number(price)) || Number(price) <= 0) {
      return { success: false, message: "Valid price is required" };
    }

    if (!category?.trim()) {
      return { success: false, message: "Category is required" };
    }

    if (!subCategory?.trim()) {
      return { success: false, message: "Sub-category is required" };
    }
  }
  // For partial updates, validate only provided fields
  else {
    if (name !== undefined && !name.trim()) {
      return { success: false, message: "Product name cannot be empty" };
    }

    if (description !== undefined && !description.trim()) {
      return { success: false, message: "Product description cannot be empty" };
    }

    if (price !== undefined && (isNaN(Number(price)) || Number(price) <= 0)) {
      return { success: false, message: "Valid price is required" };
    }

    if (category !== undefined && !category.trim()) {
      return { success: false, message: "Category cannot be empty" };
    }

    if (subCategory !== undefined && !subCategory.trim()) {
      return { success: false, message: "Sub-category cannot be empty" };
    }
  }

  return { success: true };
};
