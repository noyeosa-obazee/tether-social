const express = require("express");
const router = express.Router();
const { authenticateJWT } = require("../middleware/auth");
const {
  createPost,
  getAllPosts,
  getPostById,
  getUserPosts,
  updatePost,
  deletePost,
} = require("../controllers/postController");

router.post("/", authenticateJWT, createPost);
router.get("/", getAllPosts);
router.get("/:id", getPostById);
router.get("/user/:userId", getUserPosts);
router.put("/:id", authenticateJWT, updatePost);
router.delete("/:id", authenticateJWT, deletePost);

module.exports = router;
