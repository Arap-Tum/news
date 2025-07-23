const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();

// Create a user
exports.createUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const user = await prisma.user.create({
      data: { name, email, password }, // In real-world apps, hash passwords!
    });
    res.status(201).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Failed to create user",
      message: error.message,
    });
  }
};

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: { articles: true },
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch users",
      message: error.message,
    });
  }
};

// Get one user
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id },
      include: { articles: true },
    });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch user",
      message: error.message,
    });
  }
};

// Update a user
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password } = req.body;
    const updated = await prisma.user.update({
      where: { id },
      data: { name, email, password },
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({
      error: "Failed to update user",
      message: error.message,
    });
  }
};

// Delete a user
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.user.delete({
      where: { id },
    });
    res.json({ message: "User deleted" });
  } catch (error) {
    res.status(500).json({
      error: "Failed to delete user",
      message: error.message,
    });
  }
};
