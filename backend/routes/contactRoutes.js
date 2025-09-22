const express = require("express");
const router = express.Router();
const contactController = require("../controllers/contactController");

router.get("/", contactController.getAllContacts);
router.post("/", contactController.addContact);
router.post("/upload", contactController.uploadCSV);
router.get("/validate/:phone", contactController.validateNumber);
router.delete("/invalid/all", contactController.removeInvalidContacts);
router.delete("/all", contactController.deleteAllContacts);
router.delete("/:id", contactController.deleteContact);

module.exports = router;
