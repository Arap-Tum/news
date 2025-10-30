const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload.js");

const requireAuth = require("../middlewares/authmiddleware.js");
const requireRole = require("../middlewares/restrictRole.js");

const {
  createArticle,
  getAllArticles,
  getArticleById,
  updateArticle,
  deleteArticle,
  getMyArticles,
  getVerifiedArticles,
  verifyArticle,
  getArticleBySlug,
} = require("../controllers/articleController.js");

// ✅ New route to get logged-in user's articles
router.get("/my-articles", requireAuth, getMyArticles);

router.post(
  "/",
  requireAuth,
  requireRole("AUTHOR", "EDITOR", "ADMIN"),
  upload.single("image"),
  createArticle
);
router.get("/", requireAuth, requireRole("ADMIN"), getAllArticles);
router.get("/verified", getVerifiedArticles);

router.get("/:slug", getArticleBySlug);
router.patch("/verify/:id", requireAuth, requireRole("ADMIN"), verifyArticle);
router.get("/:id", getArticleById);
router.put("/:id", requireAuth, upload.single("image"), updateArticle);
router.delete("/:id", requireAuth, deleteArticle);

module.exports = router;
