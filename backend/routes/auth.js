const express = require("express");
const router = express.Router();
const { authenticateJWT } = require("../middleware/auth");
const {
  register,
  login,
  getCurrentUser,
  logout,
} = require("../controllers/authController");

router.post("/register", register);
router.post("/login", login);
router.get("/me", authenticateJWT, getCurrentUser);
router.post("/logout", authenticateJWT, logout);

module.exports = router;
