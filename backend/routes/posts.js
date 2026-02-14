const express = require("express");
const router = express.Router();
const { authenticateJWT } = require("../middleware/auth");
const upload = require("../middleware/upload");
const {
  createPost,
  getAllPosts,
  getPostById,
  getUserPosts,
  updatePost,
  deletePost,
} = require("../controllers/postController");

router.post("/", authenticateJWT, upload.single("image"), createPost);
router.get("/", getAllPosts);
router.get("/:id", getPostById);
router.get("/user/:userId", getUserPosts);
router.put("/:id", authenticateJWT, upload.single("image"), updatePost);
router.delete("/:id", authenticateJWT, deletePost);

module.exports = router;
