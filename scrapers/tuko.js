const Parser = require("rss-parser");
const axios = require("axios");
const cheerio = require("cheerio");

const parser = new Parser();

async function tukoNews() {
  try {
    const feed = await parser.parseURL("https://www.kenyans.co.ke/feeds/news?_wrapper_format=html");

    // Map RSS items to your schema
    const articles = await Promise.all(
      feed.items.map(async (item) => {
        let imageUrl = null;
        let content = null;

        try {
          // Fetch the full article page to extract content & image
          const { data } = await axios.get(item.link, { timeout: 15000 });
          const $ = cheerio.load(data);

          // Try to get the article image
          imageUrl =
            $("meta[property='og:image']").attr("content") ||
            $("img").first().attr("src") ||
            null;

          // Try to get the full content
          content = $(".article-body").text().trim() || $("p").text().trim() || null;
        } catch (err) {
          console.warn(`⚠️ Could not fetch full content for: ${item.link}`);
        }

        return {
          title: item.title,
          description: item.contentSnippet || item.summary || "",
          content,
          image: imageUrl,
          category: "kenya",
          date: item.pubDate ? new Date(item.pubDate) : new Date(),
          source: "tuko",
          url: item.link,
        };
      })
    );
    
 console.log(`✅ Scraped ${articles.length} articles from tuko`);

    return articles;
  } catch (error) {
    console.error("❌ Error scraping RSS:", error.message);
    return [];
  }
}

// // Example usage
// scrapeStandardPolitics().then((articles) => {
//   console.log("✅ Scraped Articles:", articles.slice(0, 2)); // show first 2
// });

module.exports = { tukoNews };