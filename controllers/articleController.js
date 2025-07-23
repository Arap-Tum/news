const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();
const fs = require("fs");
const path = require("path");

// CREATE
exports.createArticle = async (req, res) => {
  try {
    const { title, content, authorId, categoryId } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const article = await prisma.article.create({
      data: {
        title,
        content,
        imageUrl,
        authorId,
        categoryId: categoryId ? parseInt(categoryId) : undefined,
      },
    });

    res.status(201).json(article);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create article" });
  }
};

// READ ALL
exports.getAllArticles = async (req, res) => {
  try {
    const articles = await prisma.article.findMany({
      include: { author: true, category: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(articles);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch articles" });
  }
};

// READ ONE
exports.getArticleById = async (req, res) => {
  const { id } = req.params;
  try {
    const article = await prisma.article.findUnique({
      where: { id },
      include: { author: true, category: true },
    });
    if (!article) return res.status(404).json({ error: "Not found" });
    res.json(article);
  } catch (err) {
    res.status(500).json({ error: "Error retrieving article" });
  }
};

// UPDATE
exports.updateArticle = async (req, res) => {
  const { id } = req.params;
  const { title, content, categoryId } = req.body;
  try {
    const oldArticle = await prisma.article.findUnique({ where: { id } });
    if (!oldArticle) return res.status(404).json({ error: "Not found" });

    let imageUrl = oldArticle.imageUrl;
    if (req.file) {
      if (imageUrl) fs.unlinkSync(path.join(__dirname, "..", imageUrl));
      imageUrl = `/uploads/${req.file.filename}`;
    }

    const updated = await prisma.article.update({
      where: { id },
      data: {
        title,
        content,
        categoryId: categoryId ? parseInt(categoryId) : undefined,
        imageUrl,
      },
    });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Update failed" });
  }
};

// DELETE
exports.deleteArticle = async (req, res) => {
  const { id } = req.params;
  try {
    const article = await prisma.article.findUnique({ where: { id } });
    if (!article) return res.status(404).json({ error: "Not found" });

    if (article.imageUrl) {
      fs.unlinkSync(path.join(__dirname, "..", article.imageUrl));
    }

    await prisma.article.delete({ where: { id } });
    res.json({ message: "Article deleted" });
  } catch (err) {
    res.status(500).json({ error: "Delete failed" });
  }
};
