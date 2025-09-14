
# WhatsApp Bulk Sender - Installation Instructions

## Quick Start

### Option 1: Automated Installation (Recommended)

**For Linux/macOS:**
```bash
chmod +x install.sh
./install.sh
```

**For Windows:**
```
install.bat
```

### Option 2: Manual Installation

1. **Install Prerequisites:**
   - Node.js 18 or higher
   - MongoDB
   - npm

2. **Install Dependencies:**
   ```bash
   npm run install-all
   ```

3. **Setup Environment:**
   ```bash
   cp env.example .env
   # Edit .env file with your settings
   ```

4. **Start MongoDB:**
   ```bash
   mongod
   ```

5. **Start Application:**
   ```bash
   npm start
   ```

6. **Access Application:**
   Open http://localhost:3000 in your browser

### Option 3: Docker Installation

1. **Install Docker and Docker Compose**

2. **Start with Docker Compose:**
   ```bash
   docker-compose up -d
   ```

3. **Access Application:**
   Open http://localhost:3000 in your browser

## Desktop Application

To create a desktop application:

```bash
npm run dist
```

This will create installers for your operating system in the `dist` folder.

## Important Notes

⚠️ **This is an educational application only!**
- Do not use for actual bulk messaging or spam
- Respect WhatsApp's Terms of Service
- Always get explicit consent before messaging
- Use official WhatsApp Business API for production

## Support

For issues and questions:
- Check the README.md file
- Open an issue on GitHub
- Review the documentation

## Legal Notice

By using this software, you agree to:
- Use it for educational purposes only
- Not use it for spam or unauthorized messaging
- Comply with all applicable laws
- Respect WhatsApp's Terms of Service
