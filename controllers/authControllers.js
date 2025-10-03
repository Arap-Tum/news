const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();

//Register a new user
exports.register = async (req, res) => {
  const { username, email, password } = req.body;

  // Validate required fields
  if (!username) return res.status(400).json({ error: "Username is required" });
  if (!email) return res.status(400).json({ error: "email isrequired" });

  if (!password)
    return res.status(400).json({ error: " password is required" });

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user
    const user = await prisma.user.create({
      data: {
        name: username,
        email,
        password: hashedPassword,
        role: "USER",
      },
    });

    // Include role in JWT
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "5h" }
    );

    res.status(201).json({ user, token });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Failed to register user", message: error.message });
  }
};

// Login a user
exports.login = async (req, res) => {
  const { email, password } = req.body;

  // Validate required fields
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Compare the password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "5h" }
    );

    res.json({ message: "Login successful", token, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to login", message: error.message });
  }
};

exports.updatePassword = async (req, res) => {
  try {
    // 1️⃣ Get user ID from JWT (set by your auth middleware)
    const userId = req.user.id;

    // 2️⃣ Get new password from request body
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ error: "Password is required" });
    }

    // 3️⃣ Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4️⃣ Update in DB
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error updating password:", error.message);
    res.status(500).json({ error: "Failed to update password" });
  }
};
