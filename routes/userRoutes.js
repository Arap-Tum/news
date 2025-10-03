const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const requireAuth = require("../middlewares/authmiddleware.js");
const requireRole = require("../middlewares/restrictRole.js");

router.get("/", requireAuth, requireRole("ADMIN"), userController.getAllUsers);

router.get("/:id", userController.getUserById);
router.put(
  "/self",
  requireAuth,
  requireRole("USER", "AUTHOR", "EDITOR", "ADMIN"),
  userController.updateMyProfile
);
router.patch(
  "/:id",
  requireAuth,
  requireRole("ADMIN"),
  userController.updateUserRole
);
router.put(
  "/:id",
  requireAuth,
  requireRole("USER", "AUTHOR", "EDITOR", "ADMIN"),
  userController.updateUser
);
router.delete(
  "/:id",
  requireAuth,
  requireRole("ADMIN"),
  userController.deleteUser
);

module.exports = router;
