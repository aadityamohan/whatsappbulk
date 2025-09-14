const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const rateLimit = require("express-rate-limit");
const path = require("path");
const winston = require("winston");

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Logger configuration
const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: "logs/error.log", level: "error" }),
    new winston.transports.File({ filename: "logs/combined.log" }),
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Rate limiting
const limiter = rateLimit({
  windowMs: process.env.RATE_LIMIT_WINDOW * 60 * 1000,
  max: process.env.RATE_LIMIT_MAX_REQUESTS,
  message: "Too many requests from this IP",
});

app.use("/api/", limiter);

// Database connection
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    logger.info("Connected to MongoDB");
  })
  .catch((err) => {
    logger.error("MongoDB connection error:", err);
  });

// Routes
const contactRoutes = require("./routes/contactRoutes");
const messageRoutes = require("./routes/messageRoutes");

app.use("/api/contacts", contactRoutes);
app.use("/api/messages", messageRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({
    error: "Something went wrong!",
    message: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  console.log(`
    ╔════════════════════════════════════════╗
    ║   WhatsApp Bulk Sender - Educational   ║
    ║   Server running on port ${PORT}         ║
    ║   http://localhost:${PORT}              ║
    ╚════════════════════════════════════════╝
    `);
});
// QR Code endpoint for WhatsApp authentication
app.get("/api/qr", (req, res) => {
  const qrPath = path.join(__dirname, "../uploads/qr.txt");
  if (fs.existsSync(qrPath)) {
    const qr = fs.readFileSync(qrPath, "utf8");
    res.json({ qr });
  } else {
    res.json({ qr: null, message: "No QR code available. Check console." });
  }
});

// WhatsApp status endpoint
app.get("/api/whatsapp/status", async (req, res) => {
  const whatsappSender = require("./utils/whatsappSender");
  const status = await whatsappSender.getStatus();
  res.json(status);
});
