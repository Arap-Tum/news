const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload");
const {
  createArticle,
  getAllArticles,
  getArticleById,
  updateArticle,
  deleteArticle,
} = require("../controllers/articleController");

router.post("/", upload.single("image"), createArticle);
router.get("/", getAllArticles);
router.get("/:id", getArticleById);
router.put("/:id", upload.single("image"), updateArticle);
router.delete("/:id", deleteArticle);

module.exports = router;
