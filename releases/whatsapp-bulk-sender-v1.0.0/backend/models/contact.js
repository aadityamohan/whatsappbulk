const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
  },
  status: {
    type: String,
    enum: ["valid", "invalid", "pending", "blocked"],
    default: "pending",
  },
  groups: [
    {
      type: String,
    },
  ],
  customFields: {
    type: Map,
    of: String,
  },
  lastContacted: Date,
  isWhatsAppValid: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

contactSchema.index({ phone: 1 });
contactSchema.index({ status: 1 });

module.exports = mongoose.model("Contact", contactSchema);
