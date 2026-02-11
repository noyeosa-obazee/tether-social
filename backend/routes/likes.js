const express = require("express");
const router = express.Router();
const { authenticateJWT } = require("../middleware/auth");
const {
  likePost,
  unlikePost,
  getPostLikes,
  checkIfLiked,
} = require("../controllers/likeController");

router.post("/:postId", authenticateJWT, likePost);
router.delete("/:postId", authenticateJWT, unlikePost);
router.get("/post/:postId", getPostLikes);
router.get("/post/:postId/check", authenticateJWT, checkIfLiked);

module.exports = router;
