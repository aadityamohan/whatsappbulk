# 📱 WhatsApp Bulk Sender - Installation Guide

## 🚀 Quick Start

### Prerequisites

Before installing the WhatsApp Bulk Sender, ensure you have:

- **Node.js** 18.0.0 or higher
- **npm** 8.0.0 or higher
- **MongoDB** 4.4 or higher
- **Git** (optional, for development)

### Installation Methods

#### Method 1: Automated Installation (Recommended)

**For Linux/macOS:**

```bash
# Download and extract the application
# Navigate to the application directory
chmod +x install.sh
./install.sh
```

**For Windows:**

```cmd
# Download and extract the application
# Navigate to the application directory
install.bat
```

#### Method 2: Manual Installation

1. **Install Node.js and npm**

   - Download from [nodejs.org](https://nodejs.org/)
   - Verify installation:
     ```bash
     node --version  # Should be 18.0.0+
     npm --version   # Should be 8.0.0+
     ```

2. **Install MongoDB**

   - **Linux/macOS:** Follow [MongoDB Installation Guide](https://docs.mongodb.com/manual/installation/)
   - **Windows:** Download from [MongoDB Download Center](https://www.mongodb.com/try/download/community)
   - **Docker:** `docker run -d -p 27017:27017 --name mongodb mongo:latest`

3. **Install Application Dependencies**

   ```bash
   npm run install-all
   ```

4. **Setup Environment**

   ```bash
   cp env.example .env
   # Edit .env file with your settings (optional)
   ```

5. **Create Required Directories**

   ```bash
   npm run create-dirs
   ```

6. **Start MongoDB**

   ```bash
   # Linux/macOS
   mongod

   # Windows
   mongod.exe

   # Docker
   docker start mongodb
   ```

7. **Start the Application**

   ```bash
   npm start
   ```

8. **Access the Application**
   Open your browser and navigate to: `http://localhost:3000`

#### Method 3: Docker Installation

1. **Install Docker and Docker Compose**

   - [Docker Desktop](https://www.docker.com/products/docker-desktop)

2. **Start with Docker Compose**

   ```bash
   docker-compose up -d
   ```

3. **Access the Application**
   Open your browser and navigate to: `http://localhost:3000`

## 🖥️ Desktop Application

To create a desktop application:

```bash
# Install Electron dependencies
npm install

# Build desktop application
npm run dist
```

This will create installers for your operating system in the `dist` folder:

- **Windows:** `.exe` installer
- **macOS:** `.dmg` file
- **Linux:** `.AppImage` file

## 🔧 Configuration

### Environment Variables

Edit the `.env` file to customize your installation:

```env
# Server Configuration
PORT=3000
NODE_ENV=production

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/whatsapp_bulk

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100

# File Upload
MAX_FILE_SIZE=5242880

# Message Settings
DEFAULT_MESSAGE_DELAY=10
MAX_RETRY_ATTEMPTS=3
```

### MongoDB Configuration

For production use, consider:

- Setting up authentication
- Configuring replica sets
- Enabling SSL/TLS
- Setting up backups

## 🚨 Troubleshooting

### Common Issues

#### 1. Port Already in Use

```bash
# Check what's using port 3000
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Kill the process or change PORT in .env
```

#### 2. MongoDB Connection Issues

```bash
# Check if MongoDB is running
ps aux | grep mongod  # macOS/Linux
tasklist | findstr mongod  # Windows

# Start MongoDB
mongod --dbpath /path/to/your/db
```

#### 3. Permission Issues

```bash
# Fix permissions (Linux/macOS)
chmod +x install.sh
sudo chown -R $USER:$USER /path/to/app
```

#### 4. Node.js Version Issues

```bash
# Use nvm to manage Node.js versions
nvm install 18
nvm use 18
```

### Logs and Debugging

Check application logs:

```bash
# Application logs
tail -f logs/combined.log
tail -f logs/error.log

# MongoDB logs
tail -f /var/log/mongodb/mongod.log  # Linux
```

### Reset Installation

To start fresh:

```bash
# Stop all services
npm run stop  # if available
docker-compose down  # if using Docker

# Remove data
rm -rf logs uploads sessions
rm -rf backend/logs backend/uploads

# Reinstall
npm run setup
```

## 📋 Post-Installation

### Initial Setup

1. **Access the Application**

   - Open `http://localhost:3000`
   - You should see the WhatsApp Bulk Sender interface

2. **Connect WhatsApp**

   - Scan the QR code with your WhatsApp mobile app
   - Wait for "Client ready" message

3. **Import Contacts**

   - Use the CSV upload feature
   - Or add contacts manually

4. **Test the System**
   - Send a test message to yourself
   - Verify message delivery

### Security Considerations

- Change default passwords
- Configure firewall rules
- Use HTTPS in production
- Regular security updates
- Monitor logs for suspicious activity

## 🆘 Support

### Getting Help

1. **Check Documentation**

   - README.md
   - API documentation
   - Troubleshooting guides

2. **Community Support**

   - GitHub Issues
   - Community Forums
   - Stack Overflow

3. **Professional Support**
   - Contact developers
   - Commercial support options

### Reporting Issues

When reporting issues, include:

- Operating system and version
- Node.js and npm versions
- MongoDB version
- Error messages and logs
- Steps to reproduce

## ⚖️ Legal Notice

**Important:** This application is for educational purposes only. By installing and using this software, you agree to:

- Use it only for educational and learning purposes
- Not use it for spam or unauthorized messaging
- Comply with all applicable laws and regulations
- Respect WhatsApp's Terms of Service
- Obtain explicit consent before messaging anyone

**Disclaimer:** The developers are not responsible for any misuse of this application.

---

## 📚 Additional Resources

- [WhatsApp Business API](https://developers.facebook.com/docs/whatsapp)
- [Node.js Documentation](https://nodejs.org/docs/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Electron Documentation](https://www.electronjs.org/docs)

---

_Last updated: $(date)_
