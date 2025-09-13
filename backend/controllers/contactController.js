const Contact = require("../models/contact");
const csvParser = require("../utils/csvParser");
const whatsappValidator = require("../utils/whatsappValidator");
const multer = require("multer");
const path = require("path");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: process.env.MAX_FILE_SIZE || 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /csv|xlsx|xls/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only CSV and Excel files are allowed"));
    }
  },
}).single("file");

// Get all contacts
exports.getAllContacts = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, group } = req.query;
    const query = {};

    if (status) query.status = status;
    if (group) query.groups = group;

    const contacts = await Contact.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await Contact.countDocuments(query);

    res.json({
      contacts,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add single contact
exports.addContact = async (req, res) => {
  try {
    const { name, phone, email, groups } = req.body;

    // Validate WhatsApp number (simulated)
    const isValid = await whatsappValidator.checkNumber(phone);

    const contact = new Contact({
      name,
      phone,
      email,
      groups: groups || [],
      status: isValid ? "valid" : "invalid",
      isWhatsAppValid: isValid,
    });

    await contact.save();
    res.status(201).json({
      message: "Contact added successfully",
      contact,
    });
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ error: "Phone number already exists" });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
};

// Upload CSV
exports.uploadCSV = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ error: "Please upload a file" });
    }

    try {
      const contacts = await csvParser.parseCSV(req.file.path);
      const results = {
        success: 0,
        failed: 0,
        duplicate: 0,
        errors: [],
      };

      for (const contactData of contacts) {
        try {
          const isValid = await whatsappValidator.checkNumber(
            contactData.phone
          );

          const contact = new Contact({
            ...contactData,
            status: isValid ? "valid" : "invalid",
            isWhatsAppValid: isValid,
          });

          await contact.save();
          results.success++;
        } catch (error) {
          if (error.code === 11000) {
            results.duplicate++;
          } else {
            results.failed++;
            results.errors.push({
              phone: contactData.phone,
              error: error.message,
            });
          }
        }
      }

      res.json({
        message: "CSV processed",
        results,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
};

// Validate phone number
exports.validateNumber = async (req, res) => {
  try {
    const { phone } = req.params;
    const isValid = await whatsappValidator.checkNumber(phone);

    res.json({
      phone,
      isValid,
      status: isValid ? "valid" : "invalid",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete contact
exports.deleteContact = async (req, res) => {
  try {
    const { id } = req.params;
    await Contact.findByIdAndDelete(id);
    res.json({ message: "Contact deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
