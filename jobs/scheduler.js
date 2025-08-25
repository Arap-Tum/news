// scheduler/aljazeeraScheduler.js
const cron = require("node-cron");
const { scrapeAljazeeraNews } = require("../scrapers/aljazeera");
const { scrapeStandardPolitics } = require("../scrapers/standard");
const Article = require("../models/scrapedArticle");

async function startScheduler() {
  console.log("✅ Scheduler started, scraping every 8 hours...");

  // Run immediately on startup
  await runAllScrapers();

  // Run every 8 hours
  cron.schedule("0 */8 * * *", async () => {
    console.log("⏰ Running scheduled scrapers...");
    await runAllScrapers();
  });
}

async function runAllScrapers() {
  try {
    const aljazeeraArticles = await scrapeAljazeeraNews();
    const standardArticles = await scrapeStandardPolitics();

    // Merge all scraped articles
    const allArticles = [...aljazeeraArticles, ...standardArticles];

    if (allArticles.length === 0) {
      console.log("⚠️ No articles scraped this round.");
      return;
    }

    // Save to DB with upsert (avoid duplicates by title + source)
    await Article.bulkWrite(
      allArticles.map((article) => ({
        updateOne: {
          filter: { title: article.title, source: article.source },
          update: { $set: article },
          upsert: true,
        },
      }))
    );

    console.log(
      `✅ Saved ${allArticles.length} articles at ${new Date().toISOString()}`
    );
  } catch (error) {
    console.error("❌ Error running scrapers:", error);
  }
}

startScheduler();
