const express = require("express");
const cors = require("cors");
const app = express();
const path = require("path");
const cron = require('node-cron');
const https = require('https');



const articleRoutes = require("./routes/articleRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");


app.use(cors());
app.use(express.json()); // to parse JSON bodies
app.use(express.urlencoded({ extended: true })); // to parse URL-encoded bodies

app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // serve static files from uploads directory
app.use("/static", express.static(path.join(__dirname, "public"))); // serve static files from public directory


// API routes
app.use("/api/articles", articleRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);


app.get("/", (req, res) => {
    res.send("Welcome to the News API");
});     

/// Schedule a task to run every 14 minutes
cron.schedule('*/14 * * * *', function() {
  console.log('Pinging self to stay awake...');
  https.get('https://your-app.onrender.com', (resp) => {
    let data = '';
    resp.on('data', (chunk) => { data += chunk; });
    resp.on('end', () => { console.log('Self-ping successful'); });
  }).on("error", (err) => {
    console.log("Error while self-pinging: " + err.message);
  });
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});