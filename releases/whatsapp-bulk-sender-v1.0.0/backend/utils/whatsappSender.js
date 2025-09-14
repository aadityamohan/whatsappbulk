const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const fs = require("fs");
const path = require("path");

class WhatsAppSender {
  constructor() {
    this.client = null;
    this.isReady = false;
    this.initializeClient();
  }

  initializeClient() {
    console.log("Initializing WhatsApp client...");

    // Create client with persistent session
    this.client = new Client({
      authStrategy: new LocalAuth({
        dataPath: path.join(__dirname, "../../.wwebjs_auth"),
      }),
      puppeteer: {
        headless: true,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-accelerated-2d-canvas",
          "--no-first-run",
          "--no-zygote",
          "--disable-gpu",
        ],
      },
    });

    // QR Code generation for first-time auth
    this.client.on("qr", (qr) => {
      console.log("\n📱 SCAN THIS QR CODE WITH WHATSAPP:");
      qrcode.generate(qr, { small: true });

      // Also save QR as a file for web display
      fs.writeFileSync(path.join(__dirname, "../../uploads/qr.txt"), qr);
    });

    // Client ready
    this.client.on("ready", () => {
      console.log("✅ WhatsApp client is ready!");
      this.isReady = true;
    });

    // Authentication successful
    this.client.on("authenticated", () => {
      console.log("✅ WhatsApp authenticated successfully!");
    });

    // Authentication failure
    this.client.on("auth_failure", (msg) => {
      console.error("❌ WhatsApp authentication failed:", msg);
    });

    // Disconnection
    this.client.on("disconnected", (reason) => {
      console.log("❌ WhatsApp client disconnected:", reason);
      this.isReady = false;
      // Attempt to reconnect
      setTimeout(() => this.initializeClient(), 5000);
    });

    // Message events (for logging)
    this.client.on("message", (msg) => {
      console.log("📩 Received message:", msg.from, msg.body.substring(0, 50));
    });

    // Initialize the client
    this.client.initialize();
  }

  async waitForReady(timeout = 30000) {
    const startTime = Date.now();
    while (!this.isReady && Date.now() - startTime < timeout) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    return this.isReady;
  }

  async sendMessage(phone, message, mediaUrl = null) {
    try {
      if (!this.isReady) {
        console.log("⏳ Waiting for WhatsApp to be ready...");
        const ready = await this.waitForReady();
        if (!ready) {
          throw new Error("WhatsApp client is not ready");
        }
      }

      // Format phone number (remove + and add @c.us)
      let formattedPhone = phone.replace(/[^\d]/g, "");
      if (!formattedPhone.endsWith("@c.us")) {
        formattedPhone = formattedPhone + "@c.us";
      }

      console.log(`📤 Sending message to ${formattedPhone}`);

      // Check if number is registered on WhatsApp
      const isRegistered = await this.client.isRegisteredUser(formattedPhone);

      if (!isRegistered) {
        console.log(`❌ Number ${phone} is not on WhatsApp`);
        return {
          success: false,
          error: "Number not registered on WhatsApp",
          timestamp: new Date(),
        };
      }

      // Send the message
      let messageResult;

      if (mediaUrl) {
        // Send with media
        const media = MessageMedia.fromFilePath(mediaUrl);
        messageResult = await this.client.sendMessage(formattedPhone, media, {
          caption: message,
        });
      } else {
        // Send text only
        messageResult = await this.client.sendMessage(formattedPhone, message);
      }

      console.log(`✅ Message sent to ${phone}`);

      return {
        success: true,
        messageId: messageResult.id._serialized,
        timestamp: messageResult.timestamp,
        status: "sent",
      };
    } catch (error) {
      console.error(`❌ Error sending to ${phone}:`, error.message);
      return {
        success: false,
        error: error.message,
        timestamp: new Date(),
      };
    }
  }

  async checkNumber(phoneNumber) {
    try {
      if (!this.isReady) {
        await this.waitForReady();
      }

      let formattedPhone = phoneNumber.replace(/[^\d]/g, "");
      if (!formattedPhone.endsWith("@c.us")) {
        formattedPhone = formattedPhone + "@c.us";
      }

      const isRegistered = await this.client.isRegisteredUser(formattedPhone);
      return isRegistered;
    } catch (error) {
      console.error("Error checking number:", error);
      return false;
    }
  }

  async getStatus() {
    return {
      connected: this.isReady,
      status: this.isReady ? "ready" : "disconnected",
      timestamp: new Date(),
    };
  }

  async disconnect() {
    if (this.client) {
      await this.client.destroy();
      this.isReady = false;
    }
  }
}

module.exports = new WhatsAppSender();
