const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Create a category
exports.createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const category = await prisma.category.create({ data: { name } });
    res.status(201).json(category);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Failed to create category",
      message: error.message,
    });
  }
};

// Get all categories
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany();
    res.json(categories);
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch categories",
      message: error.message,
    });
  }
};

// Get one category by ID
exports.getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await prisma.category.findUnique({
      where: { id: parseInt(id) },
    });
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }
    res.json(category);
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch category",
      message: error.message,
    });
  }
};

// Update a category
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const updated = await prisma.category.update({
      where: { id: parseInt(id) },
      data: { name },
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({
      error: "Failed to update category",
      message: error.message,
    });
  }
};

// Delete a category
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.category.delete({
      where: { id: parseInt(id) },
    });
    res.json({ message: "Category deleted" });
  } catch (error) {
    res.status(500).json({
      error: "Failed to delete category",
      message: error.message,
    });
  }
};
