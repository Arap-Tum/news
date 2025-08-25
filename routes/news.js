const express = require("express");
const { getAllNews, deleteAllNews } = require("../controllers/newsController");

const router = express.Router();

router.get("/", getAllNews);

// Delete all articles
router.delete("/", deleteAllNews);

module.exports = router;
