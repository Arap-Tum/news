const express = require("express");
const cors = require("cors");
const app = express();
const path = require("path");
const cron = require('node-cron');
const https = require('https');

/**
 * Configuring the news api 
 */
// const fetch = require('node-fetch');
const dotenv = require("dotenv");
dotenv.config();


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

/*
 Proxy endpoint  to nes API 
*/
//==========================================
app.get("/api/news", async (req, res) => {
  try {
    // console.log("Fetch is:", typeof fetch); // <-- check

    const response = await fetch(
      `https://newsapi.org/v2/top-headlines?country=us&apiKey=${process.env.NEWS_API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`News API error: ${response.statusText}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Error fetching news:", error);
    res.status(500).json({ error: "Failed to fetch news" });
  }
});


//============================================

app.get("/", (req, res) => {
    res.send("Welcome to the News API");
});     

/// Schedule a task to run every 14 minutes
cron.schedule('*/14 * * * *', function() {
  console.log('Pinging self to stay awake...');
  https.get('https://news-72me.onrender.com', (resp) => {
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