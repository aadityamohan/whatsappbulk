# 📱 WhatsApp Bulk Messaging System - Educational Project
## ⚠️ IMPORTANT DISCLAIMER

**This project is created for EDUCATIONAL PURPOSES ONLY to demonstrate:**
- How bulk messaging systems work technically
- Integration with WhatsApp Web API libraries
- Contact management and validation systems
- Message queue implementation
- Rate limiting and ethical considerations

**DO NOT USE THIS FOR:**
- ❌ Actual bulk messaging or spam
- ❌ Marketing without explicit consent
- ❌ Violating WhatsApp's Terms of Service
- ❌ Any commercial purposes

**Using automated messaging violates WhatsApp's Terms of Service and can result in account bans.**

## 📚 Learning Objectives

This project helps developers understand:
- RESTful API design patterns
- WebSocket connections for real-time messaging
- CSV parsing and data validation
- Queue management for message scheduling
- Rate limiting implementation
- MongoDB database operations
- Security best practices (JWT, rate limiting, input validation)

## 🏗️ Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│   Frontend      │────▶│   Backend API   │────▶│   WhatsApp      │
│   (HTML/JS)     │     │   (Express)     │     │   (Baileys)     │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                               │
                               ▼
                        ┌─────────────────┐
                        │                 │
                        │    MongoDB      │
                        │   Database      │
                        │                 │
                        └─────────────────┘
```

## 🚀 Features

### Contact Management
- CSV file upload and parsing
- Individual contact addition
- WhatsApp number validation
- Contact grouping and tagging
- Duplicate detection

### Message System
- Template management with variables
- Personalized message generation
- Bulk message queuing
- Scheduled message sending
- Message status tracking

### Safety Features
- Rate limiting (configurable)
- Message delay implementation
- Stop/pause functionality
- Validation before sending
- Error handling and logging

## 📋 Prerequisites

- Node.js >= 18.0.0
- MongoDB >= 4.4
- npm or yarn
- WhatsApp account for testing

## 🛠️ Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/whatsapp-bulk-educational.git
cd whatsapp-bulk-educational
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
cp .env.example .env
```

Edit `.env` file:
```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database
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

4. **Start MongoDB**
```bash
mongod
```

5. **Run the application**
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

6. **Access the application**
```
http://localhost:3000
```

## 📁 Project Structure

```
whatsapp-bulk-educational/
├── backend/
│   ├── controllers/      # Request handlers
│   ├── models/           # Database schemas
│   ├── routes/           # API routes
│   ├── utils/            # Helper functions
│   ├── middleware/       # Custom middleware
│   └── server.js         # Entry point
├── frontend/
│   ├── css/             # Stylesheets
│   ├── js/              # JavaScript modules
│   └── index.html       # Main page
├── logs/                # Application logs
├── uploads/             # Temporary file storage
├── .env.example         # Environment template
├── package.json         # Dependencies
└── README.md           # Documentation
```

## 🔌 API Endpoints

### Contacts
- `GET /api/contacts` - List all contacts
- `POST /api/contacts` - Add single contact
- `POST /api/contacts/upload` - Upload CSV file
- `GET /api/contacts/validate/:phone` - Validate WhatsApp number
- `DELETE /api/contacts/:id` - Delete contact

### Messages
- `GET /api/messages` - List all messages
- `POST /api/messages/send` - Send single message
- `POST /api/messages/send-bulk` - Send bulk messages
- `GET /api/messages/templates` - Get message templates
- `POST /api/messages/schedule` - Schedule message
- `GET /api/messages/status/:id` - Check message status

### System
- `GET /api/health` - Health check
- `GET /api/whatsapp/status` - WhatsApp connection status
- `GET /api/qr` - Get QR code for authentication

## 🔧 Configuration

### Message Variables
The system supports dynamic variables in messages:
- `{{name}}` - Contact's name
- `{{phone}}` - Contact's phone number
- `{{date}}` - Current date
- `{{time}}` - Current time

### CSV Format
```csv
name,phone,email,groups
John Doe,+1234567890,john@example.com,customers
Jane Smith,+0987654321,jane@example.com,vip
```

## 🛡️ Security Considerations

- **Rate Limiting**: Prevents API abuse
- **Input Validation**: Sanitizes all user inputs
- **Authentication**: JWT tokens for API access (implement as needed)
- **CORS**: Configured for security
- **Helmet**: Security headers
- **Environment Variables**: Sensitive data protection

## 📊 Database Schema

### Contact Schema
```javascript
{
  name: String,
  phone: String (unique),
  email: String,
  status: ['valid', 'invalid', 'pending', 'blocked'],
  groups: [String],
  lastContacted: Date,
  isWhatsAppValid: Boolean
}
```

### Message Schema
```javascript
{
  contact: ObjectId,
  content: String,
  status: ['pending', 'queued', 'sent', 'failed'],
  sentAt: Date,
  scheduledFor: Date,
  error: String,
  retryCount: Number
}
```

## 🧪 Testing (Educational Only)

1. **Test with your own phone numbers only**
2. **Use small batches (< 5 contacts)**
3. **Set high delays between messages (> 30 seconds)**
4. **Monitor for any warnings from WhatsApp**

## 📚 Libraries Used

- **Backend**:
  - `@whiskeysockets/baileys` - WhatsApp Web API
  - `express` - Web framework
  - `mongoose` - MongoDB ODM
  - `multer` - File upload handling
  - `csv-parser` - CSV processing
  - `winston` - Logging
  - `helmet` - Security headers
  - `express-rate-limit` - Rate limiting

- **Frontend**:
  - Vanilla JavaScript (no framework)
  - Modern CSS with animations
  - Drag-and-drop file upload

## ⚖️ Legal & Ethical Considerations

### WhatsApp Terms of Service
- Automated messaging violates WhatsApp ToS
- Accounts can be banned permanently
- Business API is the only legal bulk messaging solution

### Privacy Laws
- GDPR (Europe)
- CAN-SPAM Act (USA)
- CASL (Canada)
- Always require explicit consent

### Best Practices
- ✅ Get explicit consent before messaging
- ✅ Provide opt-out mechanisms
- ✅ Respect user privacy
- ✅ Use official WhatsApp Business API for production
- ✅ Follow local regulations

## 🤝 Contributing

This is an educational project. Contributions that enhance learning value are welcome:

1. Fork the repository
2. Create a feature branch
3. Add educational comments
4. Submit a pull request

**Do not contribute features that:**
- Remove safety limitations
- Bypass rate limits
- Enable spam capabilities
- Violate platform policies

## 📝 License

MIT License - See [LICENSE](LICENSE) file

**By using this software, you agree to:**
- Use it for educational purposes only
- Not use it for spam or unauthorized messaging
- Comply with all applicable laws
- Respect WhatsApp's Terms of Service

## 🚨 Troubleshooting

### QR Code not appearing
- Check console for errors
- Ensure port 3000 is not blocked
- Try restarting the application

### Messages not sending
- Verify WhatsApp Web is connected
- Check contact validation status
- Review logs in `logs/` directory

### Database connection issues
- Ensure MongoDB is running
- Check connection string in `.env`
- Verify database permissions

## 📖 Learning Resources

- [WhatsApp Business API Documentation](https://developers.facebook.com/docs/whatsapp)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [MongoDB University](https://university.mongodb.com/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

## 👥 Support

For educational questions and discussions:
- Open an issue on GitHub
- Tag with `question` or `learning`
- Be specific about what you're trying to learn

## 🙏 Acknowledgments

- WhatsApp for their platform
- Open source community for libraries
- Contributors and learners

---

**Remember: This is an EDUCATIONAL project. Always use official APIs for production applications and respect user privacy and platform policies.**


---

Made with ❤️ for learning purposes only
