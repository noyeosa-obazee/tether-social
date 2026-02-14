const express = require("express");
const router = express.Router();
const { authenticateJWT } = require("../middleware/auth");
const upload = require("../middleware/upload");
const {
  register,
  login,
  getCurrentUser,
  logout,
} = require("../controllers/authController");

router.post("/register", upload.single("avatar"), register);
router.post("/login", login);
router.get("/me", authenticateJWT, getCurrentUser);
router.post("/logout", authenticateJWT, logout);

module.exports = router;
