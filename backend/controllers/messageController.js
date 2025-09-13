const Message = require("../models/Message");
const Contact = require("../models/contact");
const whatsappSender = require("../utils/whatsappSender");

// Get all messages
exports.getAllMessages = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const query = status ? { status } : {};

    const messages = await Message.find(query)
      .populate("contact", "name phone")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await Message.countDocuments(query);

    res.json({
      messages,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Send single message
exports.sendMessage = async (req, res) => {
  try {
    const { phone, message, mediaUrl } = req.body;

    if (!phone || !message) {
      return res.status(400).json({ error: "Phone and message are required" });
    }

    // Find or create contact
    let contact = await Contact.findOne({ phone });
    if (!contact) {
      contact = await Contact.create({
        name: "Unknown",
        phone,
        status: "pending",
      });
    }

    // Create message record
    const messageRecord = new Message({
      contact: contact._id,
      content: message,
      mediaUrl,
      status: "pending",
    });

    await messageRecord.save();

    // Simulate sending (educational purpose)
    setTimeout(async () => {
      try {
        const result = await whatsappSender.sendMessage(
          phone,
          message,
          mediaUrl
        );

        messageRecord.status = result.success ? "sent" : "failed";
        messageRecord.sentAt = result.success ? new Date() : null;
        messageRecord.error = result.error || null;
        await messageRecord.save();

        // Update contact last contacted
        if (result.success) {
          contact.lastContacted = new Date();
          await contact.save();
        }
      } catch (error) {
        messageRecord.status = "failed";
        messageRecord.error = error.message;
        await messageRecord.save();
      }
    }, 2000); // 2 second delay for simulation

    res.json({
      message: "Message queued for sending",
      messageId: messageRecord._id,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Send bulk messages
exports.sendBulkMessages = async (req, res) => {
  try {
    const { message, contactIds, delay = 10 } = req.body;

    if (!message || !contactIds || contactIds.length === 0) {
      return res
        .status(400)
        .json({ error: "Message and contacts are required" });
    }

    // Get valid contacts
    const contacts = await Contact.find({
      _id: { $in: contactIds },
      status: "valid",
    });

    if (contacts.length === 0) {
      return res.status(400).json({ error: "No valid contacts found" });
    }

    const results = {
      total: contacts.length,
      queued: 0,
      failed: 0,
    };

    // Queue messages with delay
    for (let i = 0; i < contacts.length; i++) {
      const contact = contacts[i];

      // Replace variables in message
      const personalizedMessage = message
        .replace(/{{name}}/g, contact.name)
        .replace(/{{phone}}/g, contact.phone)
        .replace(/{{date}}/g, new Date().toLocaleDateString())
        .replace(/{{time}}/g, new Date().toLocaleTimeString());

      // Create message record
      const messageRecord = new Message({
        contact: contact._id,
        content: personalizedMessage,
        status: "queued",
        scheduledFor: new Date(Date.now() + i * delay * 1000),
      });

      await messageRecord.save();
      results.queued++;

      // Simulate sending with delay
      setTimeout(async () => {
        try {
          const result = await whatsappSender.sendMessage(
            contact.phone,
            personalizedMessage
          );

          messageRecord.status = result.success ? "sent" : "failed";
          messageRecord.sentAt = result.success ? new Date() : null;
          messageRecord.error = result.error || null;
          await messageRecord.save();

          if (result.success) {
            contact.lastContacted = new Date();
            await contact.save();
          }
        } catch (error) {
          messageRecord.status = "failed";
          messageRecord.error = error.message;
          await messageRecord.save();
        }
      }, i * delay * 1000);
    }

    res.json({
      message: "Bulk messages queued successfully",
      results,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get message templates
exports.getTemplates = async (req, res) => {
  try {
    const templates = [
      {
        id: 1,
        name: "Welcome Message",
        content:
          "Hi {{name}}! 👋 Welcome to our service. We're glad to have you here!",
        variables: ["name"],
      },
      {
        id: 2,
        name: "Reminder",
        content:
          "Hi {{name}}, this is a reminder about your appointment on {{date}} at {{time}}.",
        variables: ["name", "date", "time"],
      },
      {
        id: 3,
        name: "Promotional",
        content:
          "🎉 Special offer for {{name}}! Get 20% off on all products. Valid until {{date}}.",
        variables: ["name", "date"],
      },
      {
        id: 4,
        name: "Follow Up",
        content:
          "Hi {{name}}, following up on our previous conversation. How can I help you today?",
        variables: ["name"],
      },
    ];

    res.json(templates);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create new template
exports.createTemplate = async (req, res) => {
  try {
    const { name, content } = req.body;

    if (!name || !content) {
      return res.status(400).json({ error: "Name and content are required" });
    }

    // Extract variables from content
    const variables = (content.match(/{{(.*?)}}/g) || []).map((v) =>
      v.replace(/[{}]/g, "")
    );

    const template = {
      id: Date.now(),
      name,
      content,
      variables,
      createdAt: new Date(),
    };

    res.status(201).json({
      message: "Template created successfully",
      template,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get message status
exports.getMessageStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const message = await Message.findById(id).populate(
      "contact",
      "name phone"
    );

    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    res.json(message);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Schedule message
exports.scheduleMessage = async (req, res) => {
  try {
    const { contactId, message, scheduledFor } = req.body;

    if (!contactId || !message || !scheduledFor) {
      return res.status(400).json({
        error: "Contact, message, and schedule time are required",
      });
    }

    const contact = await Contact.findById(contactId);
    if (!contact) {
      return res.status(404).json({ error: "Contact not found" });
    }

    const messageRecord = new Message({
      contact: contactId,
      content: message,
      status: "scheduled",
      scheduledFor: new Date(scheduledFor),
    });

    await messageRecord.save();

    // Set timeout for scheduled sending (for demo purposes)
    const delay = new Date(scheduledFor) - new Date();
    if (delay > 0) {
      setTimeout(async () => {
        try {
          const result = await whatsappSender.sendMessage(
            contact.phone,
            message
          );

          messageRecord.status = result.success ? "sent" : "failed";
          messageRecord.sentAt = result.success ? new Date() : null;
          await messageRecord.save();
        } catch (error) {
          messageRecord.status = "failed";
          messageRecord.error = error.message;
          await messageRecord.save();
        }
      }, delay);
    }

    res.json({
      message: "Message scheduled successfully",
      messageId: messageRecord._id,
      scheduledFor,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
