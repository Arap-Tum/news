const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();

const bcrypt = require("bcryptjs");

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

//  Update user (without touching role)
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password } = req.body;

    // ✅ Ensure only ADMINs can update users
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ error: "Forbidden: Admins only" });
    }

    // Prepare update object
    const data = {};
    if (name) data.name = name;
    if (email) data.email = email;
    if (password) {
      data.password = await bcrypt.hash(password, 10); // hash new password
    }

    const updated = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true, // 👀 still returned, but not updated
        createdAt: true,
        updatedAt: true,
      }, // 🚫 never return password hash
    });

    res.json(updated);
  } catch (error) {
    console.error("❌ Failed to update user:", error);
    res.status(500).json({
      error: "Failed to update user",
      message: error.message,
    });
  }
};

// Delete a user
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params; //user to delete
    const { transferId } = req.body; // new owner ID

    if (transferId) {
      //Ensure the new owner exists
      const newOner = await prisma.user.findUnique({
        where: { id: transferId },
      });

      if (!newOner) {
        return res.status(400).json({
          error: "Invalid transferId",
          message: "User for tansfer does not exist",
        });
      }

      //transfer all articles to new user
      const transferResult = await prisma.article.updateMany({
        where: { authorId: id },
        data: { authorId: transferId },
      });

      console.log(
        `✅ Transferred ${transferResult.count} articles to user ${transferId}`
      );
    } else {
      // Delete all articles from user
      const deleteResult = await prisma.article.deleteMany({
        where: { authorId: id },
      });
      console.log(`🗑️ Deleted ${deleteResult.count} articles from user ${id}`);
    }
    //Now delete the user
    await prisma.user.delete({
      where: { id },
    });

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({
      error: "Failed to delete user",
      message: error.message,
    });

    console.log("Error message:", error.message);
  }
};

// Admin: Update only user role
exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    // ✅ Only admins can change roles
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ error: "Forbidden: Admins only" });
    }

    // ✅ Validate role against enum
    const allowedRoles = ["USER", "AUTHOR", "EDITOR", "ADMIN"];
    if (!role || !allowedRoles.includes(role)) {
      return res.status(400).json({ error: "Invalid role provided" });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json({
      message: `User role updated to ${role}`,
      user: updated,
    });
  } catch (error) {
    console.error("❌ Failed to update user role:", error);
    res.status(500).json({
      error: "Failed to update user role",
      message: error.message,
    });
  }
};

// User: update own profile (not role)
exports.updateMyProfile = async (req, res) => {
  try {
    const userId = req.user.userId; // comes from JWT
    const { name, email, password } = req.body;

    // build update data object
    const data = {};
    if (name) data.name = name;
    if (email) data.email = email;
    if (password) {
      data.password = await bcrypt.hash(password, 10);
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true, // returned, but not editable
        createdAt: true,
        updatedAt: true,
      }, // 🚫 never return password
    });

    res.json({
      message: "Profile updated successfully",
      user: updated,
    });
  } catch (error) {
    console.error("❌ Failed to update profile:", error);
    res.status(500).json({
      error: "Failed to update profile",
      message: error.message,
    });
  }
};
