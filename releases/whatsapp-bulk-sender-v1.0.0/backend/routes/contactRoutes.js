const express = require("express");
const router = express.Router();
const contactController = require("../controllers/contactController");

router.get("/", contactController.getAllContacts);
router.post("/", contactController.addContact);
router.post("/upload", contactController.uploadCSV);
router.get("/validate/:phone", contactController.validateNumber);
router.delete("/:id", contactController.deleteContact);

module.exports = router;
