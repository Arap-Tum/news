const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();

const {
  processImage,
  uploadImageToCloudinary,
  extractPublicId,
  deleteImageFromCloudinary,
} = require("../middlewares/imageProcessor.js");

// CREATE
exports.createArticle = async (req, res) => {
  if (!req.body.title || !req.body.content) {
    return res.status(400).json({ error: "Title, content,  are required" });
  }

  try {
    const {
      title,
      subtitle,
      excerpt,
      content,
      categoryId,
      countyId,
      isTrending,
      isFeatured,
    } = req.body;

    //GENERATE SLUNG
    function generateSlug(title) {
      return title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "") //THIS REMOVES NONE WORD CHARACTERS
        .replace(/\s+/g, "-") //replace spaces with dashes
        .replace(/--+/g, "-"); //remove multiple dashes
    }

    // make SLUNG unique
    async function generateUniqueSlug(title) {
      let slug = generateSlug(title);
      let existing = await prisma.article.findUnique({ where: { slug } });

      let counter = 1;
      while (existing) {
        const newSlug = `${slug}-${counter}`;
        existing = await prisma.article.findUnique({
          where: { slug: newSlug },
        });
        if (!existing) {
          slug = newSlug;
          break;
        }
        counter++;
      }

      return slug;
    }

    // usage
    const slug = await generateUniqueSlug(title);

    let imageUrl = null;
    if (req.file) {
      const processed = await processImage(req.file.buffer);
      const result = await uploadImageToCloudinary(processed.buffer);
      imageUrl = result.secure_url;
    }

    const article = await prisma.article.create({
      data: {
        title,
        subtitle: subtitle || null,
        excerpt: excerpt || null,
        slug,
        content,
        imageUrl,
        authorId: req.user.id,
        categoryId: categoryId ? parseInt(categoryId) : null,
        countyId: countyId ? parseInt(countyId) : null,
        isTrending: isTrending === "true" || isTrending === true,
        isFeatured: isFeatured === "true" || isFeatured === true,
      },
    });

    res.status(201).json(article);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Failed to create article",
      message: error.message,
    });
  }
};

// READ ALL
exports.getAllArticles = async (req, res) => {
  try {
    const articles = await prisma.article.findMany({
      include: {
        author: {
          select: { id: true, name: true, email: true, role: true }, // avoid password leak
        },
        category: true,
        county: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(articles);
  } catch (err) {
    console.error("❌ Failed to fetch articles:", err);
    res.status(500).json({ error: "Failed to fetch articles" });
  }
};

//Read by Author
exports.getMyArticles = async (req, res) => {
  try {
    const userId = req.user.userId;

    const articles = await prisma.article.findMany({
      where: { authorId: userId },
      include: {
        category: true,
        county: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(articles);
  } catch (error) {
    console.error("❌ Failed to fetch user articles:", error);
    res.status(500).json({ error: "Failed to fetch your articles" });
  }
};

// READ ONE
exports.getArticleById = async (req, res) => {
  const { id } = req.params;
  try {
    const article = await prisma.article.findUnique({
      where: { id },
      include: { author: true, category: true, county: true },
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

  try {
    const oldArticle = await prisma.article.findUnique({ where: { id } });
    if (!oldArticle) {
      return res.status(404).json({ error: "Article not found" });
    }

    let imageUrl = oldArticle.imageUrl;

    // If new image uploaded, replace the old one
    if (req.file) {
      if (imageUrl) {
        const oldPublicId = extractPublicId(imageUrl);
        await deleteImageFromCloudinary(oldPublicId);
      }
      const processed = await processImage(req.file.buffer);
      const uploadResult = await uploadImageToCloudinary(processed.buffer);
      imageUrl = uploadResult.secure_url;
    }

    const {
      title,
      subtitle,
      excerpt,
      slug,
      content,
      categoryId,
      countyId,
      isTrending,
      isFeatured,
      verificationStatus,
      verifiedAt,
    } = req.body;

    const updated = await prisma.article.update({
      where: { id },
      data: {
        title: title || oldArticle.title,
        subtitle: subtitle || null,
        excerpt: excerpt || null,
        slug: slug || null,
        content: content || oldArticle.content,
        imageUrl,
        authorId: req.user.userId, // ensure logged-in user updates
        categoryId: categoryId ? parseInt(categoryId) : null,
        countyId: countyId ? parseInt(countyId) : null,
        isTrending: isTrending === "true" || isTrending === true,
        isFeatured: isFeatured === "true" || isFeatured === true,
        verificationStatus: verificationStatus || oldArticle.verificationStatus,
        verifiedAt: verifiedAt ? new Date(verifiedAt) : oldArticle.verifiedAt,
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
    const article = await prisma.article.findUnique({ where: { id } });
    if (!article) return res.status(404).json({ error: "Not found" });

    // Delete Cloudinary image if it exists
    if (article.imageUrl) {
      const publicId = extractPublicId(article.imageUrl);
      await deleteImageFromCloudinary(publicId);
    }

    await prisma.article.delete({ where: { id } });
    res.json({ message: "Article deleted" });
  } catch (err) {
    console.error("❌ Error deleting article:", err);
    res.status(500).json({ error: "Delete failed", message: err.message });
  }
};

// GET verified articles only
exports.getVerifiedArticles = async (req, res) => {
  try {
    const articles = await prisma.article.findMany({
      where: {
        verificationStatus: "APPROVED", // adjust enum if different
        NOT: {
          verifiedAt: null, // must have a verified date
        },
      },
      orderBy: {
        verifiedAt: "desc", // newest verified first
      },
      include: {
        author: true,
        category: true,
        county: true,
      },
    });

    res.json(articles);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Failed to fetch verified articles",
      message: error.message,
    });
  }
};

// ADMIN: Verify / Reject article
exports.verifyArticle = async (req, res) => {
  const { id } = req.params;
  const { verificationStatus } = req.body;

  // Ensure only allowed statuses are used
  if (!["APPROVED", "REJECTED", "PENDING"].includes(verificationStatus)) {
    return res.status(400).json({ error: "Invalid verification status" });
  }

  try {
    const article = await prisma.article.findUnique({ where: { id } });
    if (!article) {
      return res.status(404).json({ error: "Article not found" });
    }

    // ✅ Only ADMIN (or EDITOR if you want) can verify
    if (!["ADMIN", "EDITOR"].includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden: Insufficient role" });
    }

    const updated = await prisma.article.update({
      where: { id },
      data: {
        verificationStatus,
        verifiedAt: verificationStatus === "APPROVED" ? new Date() : null,
      },
    });

    res.json({
      message: `Article ${verificationStatus.toLowerCase()}`,
      article: updated,
    });
  } catch (err) {
    console.error("❌ Error verifying article:", err);
    res
      .status(500)
      .json({ error: "Verification failed", message: err.message });
  }
};
