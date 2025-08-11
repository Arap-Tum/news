const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();


const{
   processImage, uploadImageToCloudinary, extractPublicId, deleteImageFromCloudinary
} = require('../middlewares/imageProcessor.js');

// CREATE
exports.createArticle = async (req, res) => {

   console.log("req.file:", req.file);
  console.log("req.body:", req.body);
 
  // Validate required fields
  if (!req.body.title || !req.body.content || !req.body.authorId) {
    return res.status(400).json({ error: "Title, content, and authorId are required" });
  }

  try {
    const { title, content, authorId, categoryId, isTrending , isFeatured} = req.body;
let imageUrl = null;
if (req.file) {
  const processed = await processImage(req.file.buffer);
  const result = await uploadImageToCloudinary(processed.buffer);
  imageUrl = result.secure_url; // This is the actual image URL from Cloudinary
}
    const article = await prisma.article.create({
      data: {
        title,
        content,
        imageUrl,
        authorId,
        isTrending,
        isFeatured,
        categoryId: categoryId ? parseInt(categoryId) : undefined,
      },
    });

    res.status(201).json(article);
  } catch (error) {
    console.error(error);

    res.status(500).json({
    error: "Failed to create article",
    message: error.message,         // this gives the actual error message
    stack: error.stack,             // optional: includes stack trace for dev
  });
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

//Read by Author
exports.getMyArticles = async (req, res) => {
  try {
    const userId = req.user.userId;

    const articles = await prisma.article.findMany({
      where: {
        authorId: userId,
      },
    });

    res.json(articles);
  } catch (error) {
    console.error("Failed to fetch user articles:", error);
    res.status(500).json({ error: "Failed to fetch your articles" });
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
  const { title, content, categoryId, isTrending, authorId, isFeatured } = req.body;
  try {
 const oldArticle = await prisma.article.findUnique({
    where: {id },
  });
  if (!oldArticle) return res.status(404).json({ error: "Article not found" });


    let imageUrl = oldArticle.imageUrl;

    // Process new image if provided
    if (req.file) {
        // Delete the old image from Cloudinary (if it exists)
      if (imageUrl) {
        const oldPublicId = extractPublicId(imageUrl);
        await deleteImageFromCloudinary(oldPublicId);
      }

       // Process and upload the new image
      const processed = await processImage(req.file.buffer);
      const uploadResult = await uploadImageToCloudinary(processed.buffer);
      imageUrl = uploadResult.secure_url;
    }

    // Update article in the DB
    const updated = await prisma.article.update({
      where: { id: (id) },
      data: {
        title,
        content,
        categoryId: categoryId ? parseInt(categoryId) : undefined,
        imageUrl,
        authorId,
        isTrending,
        isFeatured,
      },
    });

    res.json(updated);
  } catch (err) {
 console.error("❌ Error updating article:", err);
    res.status(500).json({ error: "Update failed", message: err.message });
  }
};

// DELETE
exports.deleteArticle = async (req, res) => {
  const { id } = req.params;

  try {
    const article = await prisma.article.findUnique({ where: { id} });
    if (!article) return res.status(404).json({ error: "Not found" });

    // Delete Cloudinary image if it exists
    if (article.imageUrl) {
      const publicId = extractPublicId(article.imageUrl);
      await deleteImageFromCloudinary(publicId);
    }

    await prisma.article.delete({ where: {id} });
    res.json({ message: "Article deleted" });
  } catch (err) {
    console.error("❌ Error deleting article:", err);
    res.status(500).json({ error: "Delete failed", message: err.message });
  }
};

