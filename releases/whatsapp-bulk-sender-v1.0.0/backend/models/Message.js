const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  contact: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Contact",
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  mediaUrl: {
    type: String,
  },
  status: {
    type: String,
    enum: ["pending", "queued", "sending", "sent", "failed", "scheduled"],
    default: "pending",
  },
  sentAt: {
    type: Date,
  },
  scheduledFor: {
    type: Date,
  },
  deliveredAt: {
    type: Date,
  },
  readAt: {
    type: Date,
  },
  error: {
    type: String,
  },
  retryCount: {
    type: Number,
    default: 0,
  },
  metadata: {
    type: Map,
    of: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

messageSchema.index({ contact: 1, status: 1 });
messageSchema.index({ scheduledFor: 1 });
messageSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Message", messageSchema);
