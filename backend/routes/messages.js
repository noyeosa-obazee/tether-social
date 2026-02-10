const express = require("express");
const router = express.Router();
const { authenticateJWT } = require("../middleware/auth");
const messageController = require("../controllers/messageController");

router.use(authenticateJWT);

router.post("/", messageController.sendMessage);
router.get("/:conversationId", messageController.getMessages);
router.put("/:id", messageController.editMessage);
router.delete("/:id", messageController.deleteMessage);

module.exports = router;
