const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload.js");

const requireAuth = require('../middlewares/authmiddleware.js')

const {  createArticle,  getAllArticles, getArticleById,  updateArticle, deleteArticle, getMyArticles } = require("../controllers/articleController.js");


// ✅ New route to get logged-in user's articles
router.get("/my-articles", requireAuth, getMyArticles);

router.post("/", upload.single("image"), createArticle);
router.get("/",  getAllArticles);
router.get("/:id",  getArticleById);
router.put("/:id", upload.single("image"), updateArticle);
router.delete("/:id",  deleteArticle);

module.exports = router;
