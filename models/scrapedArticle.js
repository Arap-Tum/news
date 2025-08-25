const mongoose = require("mongoose");

const ArticleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    content: String,
    image: String,
    category: String,
    date: { type: Date, default: Date.now, index: { expires: "30d" } },
    source: String,
    url: String, // link to original article
  },
  { timestamps: true }
);

ArticleSchema.index({ title: 1, source: 1 }, { unique: true }); // avoid duplicates

module.exports = mongoose.model("Article", ArticleSchema);