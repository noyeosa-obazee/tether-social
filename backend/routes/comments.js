const express = require("express");
const router = express.Router();
const { authenticateJWT } = require("../middleware/auth");
const {
  createComment,
  getPostComments,
  getCommentById,
  updateComment,
  deleteComment,
} = require("../controllers/commentController");

router.post("/", authenticateJWT, createComment);
router.get("/post/:postId", getPostComments);
router.get("/:id", getCommentById);
router.put("/:id", authenticateJWT, updateComment);
router.delete("/:id", authenticateJWT, deleteComment);

module.exports = router;
