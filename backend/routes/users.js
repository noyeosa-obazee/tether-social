const express = require("express");
const router = express.Router();
const { authenticateJWT } = require("../middleware/auth");
const {
  getUserById,
  getAllUsers,
  updateUserProfile,
  deleteUser,
  getUserStats,
  changePassword,
} = require("../controllers/userController");

router.get("/", getAllUsers);
router.get("/:id", getUserById);
router.get("/:id/stats", getUserStats);
router.put("/:id", authenticateJWT, updateUserProfile);
router.delete("/:id", authenticateJWT, deleteUser);
router.post("/:id/change-password", authenticateJWT, changePassword);

module.exports = router;
