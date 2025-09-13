const {
  makeWASocket,
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
} = require("@whiskeysockets/baileys");
const P = require("pino");
const path = require("path");
const fs = require("fs");
const qrcode = require("qrcode-terminal");

class BaileysWhatsAppSender {
  constructor() {
    this.sock = null;
    this.isReady = false;
    this.initializeConnection();
  }

  async initializeConnection() {
    const authFolder = path.join(__dirname, "../../baileys_auth");

    // Create auth folder if it doesn't exist
    if (!fs.existsSync(authFolder)) {
      fs.mkdirSync(authFolder, { recursive: true });
    }

    const { state, saveCreds } = await useMultiFileAuthState(authFolder);
    const { version } = await fetchLatestBaileysVersion();

    this.sock = makeWASocket({
      version,
      auth: state,
      logger: P({ level: "warn" }),
      printQRInTerminal: false,
      browser: ["WhatsApp Bulk Sender", "Chrome", "1.0.0"],
    });

    this.sock.ev.on("connection.update", (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        console.log("\n📱 SCAN THIS QR CODE WITH WHATSAPP:");
        console.log(
          "Open WhatsApp > Settings > Linked Devices > Link a Device\n"
        );
        qrcode.generate(qr, { small: true });
      }

      if (connection === "close") {
        const shouldReconnect =
          lastDisconnect?.error?.output?.statusCode !==
          DisconnectReason.loggedOut;
        console.log(
          "Connection closed due to",
          lastDisconnect?.error,
          ", reconnecting:",
          shouldReconnect
        );

        if (shouldReconnect) {
          setTimeout(() => this.initializeConnection(), 5000);
        }
      } else if (connection === "open") {
        console.log("✅ Connected to WhatsApp Web!");
        this.isReady = true;
      }
    });

    this.sock.ev.on("creds.update", saveCreds);
  }

  async sendMessage(phone, message) {
    try {
      if (!this.isReady) {
        throw new Error("WhatsApp not connected. Please scan QR code first.");
      }

      // Format phone for Baileys
      let formattedPhone = phone.replace(/[^\d]/g, "");
      if (!formattedPhone.includes("@")) {
        formattedPhone = formattedPhone + "@s.whatsapp.net";
      }

      const result = await this.sock.sendMessage(formattedPhone, {
        text: message,
      });

      console.log(`✅ Message sent to ${phone}`);

      return {
        success: true,
        messageId: result.key.id,
        timestamp: new Date(),
        status: "sent",
      };
    } catch (error) {
      console.error("Error sending message:", error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date(),
      };
    }
  }

  async checkNumber(phone) {
    try {
      if (!this.isReady) return false;

      let formattedPhone = phone.replace(/[^\d]/g, "");
      const [result] = await this.sock.onWhatsApp(formattedPhone);

      return result?.exists || false;
    } catch (error) {
      console.error("Error checking number:", error);
      return false;
    }
  }

  async waitForReady(timeout = 30000) {
    const startTime = Date.now();
    while (!this.isReady && Date.now() - startTime < timeout) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    return this.isReady;
  }

  async getStatus() {
    return {
      connected: this.isReady,
      status: this.isReady ? "ready" : "disconnected",
      timestamp: new Date(),
    };
  }
}

module.exports = new BaileysWhatsAppSender();
