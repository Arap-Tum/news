const express = require("express");
const cors = require("cors");
const app = express();
const path = require("path");
const articleRoutes = require("./routes/articleRoutes");

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/articles", articleRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
