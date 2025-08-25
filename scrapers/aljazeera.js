const puppeteer = require("puppeteer");

async function scrapeAljazeeraNews() {
  const browser = await puppeteer.launch({
    headless: true, // or false for debugging
    // no need for executablePath if using puppeteer (bundled Chromium)
  });
  const page = await browser.newPage();

  try {
    const url = "https://www.aljazeera.com/";
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });

    await page.waitForSelector("article", { timeout: 20000 });

    const articles = await page.evaluate(() => {
      const items = [];
      document.querySelectorAll("article").forEach((article) => {
        const titleEl = article.querySelector("h3 a");
        const imgEl = article.querySelector("img");
        const descEl = article.querySelector("p");

        if (titleEl) {
          items.push({
            title: titleEl.innerText.trim(),
            url: titleEl.href,
            image: imgEl ? imgEl.src : null,
            description: descEl ? descEl.innerText.trim() : null,
            source: "Al Jazeera",
            category: 'general',
            // date: new Date(item.pubDate),
          });
        }
      });
      return items;
    });


    console.log(`✅ Scraped Al Jazeera ${articles.length} articles`);
    // console.log(articles);

    await browser.close();
    return articles;
  } catch (err) {
    console.error("❌ Error scraping:", err.message);
    await browser.close();
    return [];
  }
}

module.exports = { scrapeAljazeeraNews };
