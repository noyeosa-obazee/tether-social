const express = require("express");
const router = express.Router();
const { authenticateJWT } = require("../middleware/auth");
const conversationController = require("../controllers/conversationController");

router.use(authenticateJWT);

router.post("/", conversationController.createConversation);
router.get("/", conversationController.getMyConversations);

module.exports = router;
