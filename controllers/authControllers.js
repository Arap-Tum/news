const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();


//Register a new user
exports.register = async (req, res) => {
    const { username, email, password } = req.body;
    
    // Validate required fields
    if (!username || !email || !password) {
        return res.status(400).json({ error: "Username, email, and password are required" });
    }
    
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
        },
        });

        res.status(201).json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to register user", message: error.message });
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
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ message: "Login successful", token, user});
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to login", message: error.message });
    }
}