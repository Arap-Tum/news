const express = require("express");
const cors = require("cors");
const app = express();
const path = require("path");
const articleRoutes = require("./routes/articleRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const userRoutes = require("./routes/userRoutes");

app.use(cors());
app.use(express.json()); // to parse JSON bodies
app.use(express.urlencoded({ extended: true })); // to parse URL-encoded bodies

app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // serve static files from uploads directory
app.use("/static", express.static(path.join(__dirname, "public"))); // serve static files from public directory

app.use("/api/articles", articleRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/users", userRoutes);

app.get("/", (req, res) => {
    res.send("Welcome to the News API");
});     

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});