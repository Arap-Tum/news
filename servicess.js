const express = require('express');
const axios = require('axios');

const router = express.Router();

// GET /politics
router.get("/politics", async (req, res) => {
  try {
    const apiKey = "pub_536509170ecd4806b0acea53cb22da4f";
    const url = `https://newsdata.io/api/1/latest?apikey=${apiKey}&q=politics`;

    const response = await axios.get(url);
    res.json(response.data); // send API response to frontend
  } catch (error) {
    console.error("Error fetching politics news:", error.message);
    res.status(500).json({ error: "Failed to fetch politics news" });
  }
});

// GET /kenya
router.get("/kenya", async (req, res) => {
  try {
    const apiKey = "pub_536509170ecd4806b0acea53cb22da4f";
    const url = `https://newsdata.io/api/1/latest?apikey=${apiKey}&q=kenya`;

    const response = await axios.get(url);
    res.json(response.data); // send API response to frontend
  } catch (error) {
    console.error("Error fetching kenya news:", error.message);
    res.status(500).json({ error: "Failed to fetch kenya news" });
  }
});

// GET /kenya
router.get("/wordPolitics", async (req, res) => {
  try {
    const apiKey = "pub_536509170ecd4806b0acea53cb22da4f";
    const url = `https://newsdata.io/api/1/latest?apikey=${apiKey}&q=WORLD%20POLITICS`;

    const response = await axios.get(url);
    res.json(response.data); // send API response to frontend
  } catch (error) {
    console.error("Error fetching world news:", error.message);
    res.status(500).json({ error: "Failed to fetch world news" });
  }
});

module.exports = router;
