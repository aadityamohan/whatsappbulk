const {
  makeWASocket,
  DisconnectReason,
  useMultiFileAuthState,
} = require("@whiskeysockets/baileys");
const qrcode = require("qrcode-terminal");
const path = require("path");

class BaileysWhatsApp {
  constructor() {
    this.sock = null;
    this.isReady = false;
    this.initializeConnection();
  }

  async initializeConnection() {
    const { state, saveCreds } = await useMultiFileAuthState(
      path.join(__dirname, "../../baileys_auth")
    );

    this.sock = makeWASocket({
      auth: state,
      printQRInTerminal: false,
    });

    this.sock.ev.on("connection.update", (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        console.log("\n📱 SCAN THIS QR CODE WITH WHATSAPP:");
        qrcode.generate(qr, { small: true });
      }

      if (connection === "close") {
        const shouldReconnect =
          lastDisconnect?.error?.output?.statusCode !==
          DisconnectReason.loggedOut;
        console.log("Connection closed, reconnecting:", shouldReconnect);

        if (shouldReconnect) {
          setTimeout(() => this.initializeConnection(), 5000);
        }
      } else if (connection === "open") {
        console.log("✅ Connected to WhatsApp!");
        this.isReady = true;
      }
    });

    this.sock.ev.on("creds.update", saveCreds);
  }

  async sendMessage(phone, message) {
    try {
      if (!this.isReady) {
        throw new Error("WhatsApp not connected");
      }

      // Format phone for Baileys (country code + number @s.whatsapp.net)
      let formattedPhone = phone.replace(/[^\d]/g, "");
      if (!formattedPhone.includes("@")) {
        formattedPhone = formattedPhone + "@s.whatsapp.net";
      }

      const result = await this.sock.sendMessage(formattedPhone, {
        text: message,
      });

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
}

module.exports = new BaileysWhatsApp();
