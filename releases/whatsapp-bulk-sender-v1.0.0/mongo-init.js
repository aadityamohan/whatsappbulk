// MongoDB initialization script
db = db.getSiblingDB("whatsapp_bulk");

// Create collections
db.createCollection("contacts");
db.createCollection("messages");

// Create indexes for better performance
db.contacts.createIndex({ phone: 1 }, { unique: true });
db.contacts.createIndex({ email: 1 });
db.contacts.createIndex({ groups: 1 });
db.contacts.createIndex({ status: 1 });

db.messages.createIndex({ contact: 1 });
db.messages.createIndex({ status: 1 });
db.messages.createIndex({ sentAt: 1 });
db.messages.createIndex({ scheduledFor: 1 });

// Insert sample data (optional)
db.contacts.insertOne({
  name: "Sample Contact",
  phone: "+1234567890",
  email: "sample@example.com",
  status: "valid",
  groups: ["sample"],
  lastContacted: new Date(),
  isWhatsAppValid: true,
  createdAt: new Date(),
  updatedAt: new Date(),
});

print("Database initialized successfully!");
