const express = require("express");
const router = express.Router();
const messageController = require("../controllers/messageController");

router.get("/", messageController.getAllMessages);
router.post("/send", messageController.sendMessage);
router.post("/send-bulk", messageController.sendBulkMessages);
router.get("/templates", messageController.getTemplates);
router.post("/templates", messageController.createTemplate);
router.get("/status/:id", messageController.getMessageStatus);
router.post("/schedule", messageController.scheduleMessage);

module.exports = router;
