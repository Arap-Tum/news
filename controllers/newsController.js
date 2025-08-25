const Article = require("../models/scrapedArticle.js");

const getAllNews = async (req, res) => {
  try {
    const { category, search } = req.query;

    let filter = {};
    if (category) filter.category = category;
    if (search) filter.title = { $regex: search, $options: "i" };

    const articles = await Article.find(filter).sort({ date: -1 }).limit(50);
    res.json(articles);
    console.log(`Articles fetched successfully: ${articles.length} articles found`);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch news" });
  }
};

// Delete all articles
const deleteAllNews = async (req, res) => {
  try {
    const result = await Article.deleteMany({});
    res.json({ message: "All articles deleted successfully", deletedCount: result.deletedCount });
    console.log(`🗑️ Deleted ${result.deletedCount} articles`);
  } catch (err) {
    console.error("Error deleting articles:", err);
    res.status(500).json({ error: "Failed to delete all news" });
  }
};

module.exports = { getAllNews, deleteAllNews };
