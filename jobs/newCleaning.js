// jobs/cleanup.js
const cron = require("node-cron");
const Article = require("../models/scrapedArticle");

// Run every day at midnight
cron.schedule("0 0 * * *", async () => {
  try {
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 18);

    const result = await Article.deleteMany({ createdAt: { $lt: twoWeeksAgo } });

    console.log(`🧹 Cleanup Job: Deleted ${result.deletedCount} old articles`);
  } catch (err) {
    console.error("❌ Cleanup error:", err.message);
  }
});
