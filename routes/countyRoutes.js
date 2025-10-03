const express = require("express");
const router = express.Router();
const countyController = require("../controllers/countyController");
const requireAuth = require("../middlewares/authmiddleware.js");
const requireRole = require("../middlewares/restrictRole.js");

router.post(
  "/",
  requireAuth,
  requireRole("EDITOR", "ADMIN"),
  countyController.createCounty
);

router.get("/", countyController.getCounties);
router.get("/:id", countyController.getCountyById);
router.put(
  "/:id",
  requireAuth,
  requireRole("EDITOR", "ADMIN"),
  countyController.updateCounty
);
router.delete(
  "/:id",
  requireAuth,
  requireRole("EDITOR", "ADMIN"),
  countyController.deleteCounty
);

module.exports = router;
