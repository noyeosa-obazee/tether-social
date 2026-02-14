const express = require("express");
const router = express.Router();
const {
  authenticateJWT,
  optionalAuthenticateJWT,
} = require("../middleware/auth");
const upload = require("../middleware/upload");
const {
  getUserById,
  getAllUsers,
  updateUserProfile,
  deleteUser,
  getUserStats,
  changePassword,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  isFollowing,
} = require("../controllers/userController");

router.get("/", getAllUsers);

// Place specific routes before the generic /:id route
router.get("/:id/stats", getUserStats);
router.get("/:id/followers", getFollowers);
router.get("/:id/following", getFollowing);
router.get("/:id/is-following", authenticateJWT, isFollowing);

// Generic user routes
router.get("/:id", optionalAuthenticateJWT, getUserById);
router.put("/:id", authenticateJWT, upload.single("avatar"), updateUserProfile);
router.delete("/:id", authenticateJWT, deleteUser);
router.post("/:id/change-password", authenticateJWT, changePassword);
router.post("/:id/follow", authenticateJWT, followUser);
router.post("/:id/unfollow", authenticateJWT, unfollowUser);

module.exports = router;
