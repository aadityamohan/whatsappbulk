#!/bin/bash

# WhatsApp Bulk Sender - Release Creation Script
# This script creates a complete release package ready for distribution

set -e

echo "🚀 WhatsApp Bulk Sender - Creating Release Package"
echo "=================================================="

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Get version from package.json
VERSION=$(node -p "require('./package.json').version")
RELEASE_NAME="whatsapp-bulk-sender-v${VERSION}"

print_status "Creating release: $RELEASE_NAME"

# Clean previous releases
if [ -d "releases" ]; then
    rm -rf releases
fi
mkdir -p releases

# Create the distribution package
print_status "Creating distribution package..."
npm run package

# Create release directory
RELEASE_DIR="releases/$RELEASE_NAME"
mkdir -p "$RELEASE_DIR"

# Copy distribution files
print_status "Copying distribution files..."
cp -r dist/* "$RELEASE_DIR/"

# Create platform-specific packages
print_status "Creating platform-specific packages..."

# Create ZIP for Windows/Universal
cd releases
zip -r "${RELEASE_NAME}.zip" "$RELEASE_NAME"
print_status "Created: ${RELEASE_NAME}.zip"

# Create TAR.GZ for Linux/macOS
tar -czf "${RELEASE_NAME}.tar.gz" "$RELEASE_NAME"
print_status "Created: ${RELEASE_NAME}.tar.gz"

# Create release notes
cat > "${RELEASE_NAME}-RELEASE-NOTES.md" << EOF
# WhatsApp Bulk Sender v${VERSION} - Release Notes

## 🎉 What's New

This release includes the complete WhatsApp Bulk Sender educational application with:

### ✅ Features
- Complete web application with frontend and backend
- Desktop application support (Electron)
- Docker containerization
- Automated installation scripts
- Comprehensive documentation
- Cross-platform compatibility

### 📦 Installation Options

#### Option 1: Automated Installation
- **Windows:** Run \`install.bat\`
- **Linux/macOS:** Run \`./install.sh\`

#### Option 2: Docker
\`\`\`bash
docker-compose up -d
\`\`\`

#### Option 3: Manual Installation
\`\`\`bash
npm run install-all
npm start
\`\`\`

### 📋 Requirements
- Node.js 18.0.0+
- MongoDB 4.4+
- npm 8.0.0+

### 🚨 Important Notes
- This is an EDUCATIONAL application only
- Do not use for actual bulk messaging or spam
- Respect WhatsApp's Terms of Service
- Always get explicit consent before messaging

### 📚 Documentation
- README.md - Main documentation
- INSTALLATION.md - Detailed installation guide
- USER_GUIDE.md - Complete user manual

### 🔧 Support
For issues and questions:
- Check the documentation
- Open an issue on GitHub
- Review the troubleshooting guides

---

**Download Options:**
- \`${RELEASE_NAME}.zip\` - Universal package
- \`${RELEASE_NAME}.tar.gz\` - Linux/macOS package
- \`${RELEASE_NAME}/\` - Directory with all files

**Legal Notice:** This software is for educational purposes only. By downloading and using this software, you agree to the terms in the LICENSE file.
EOF

print_status "Created: ${RELEASE_NAME}-RELEASE-NOTES.md"

cd ..

# Display release information
echo ""
print_status "Release created successfully! 🎉"
echo ""
echo "📁 Release location: releases/$RELEASE_NAME"
echo "📦 Packages created:"
echo "  - releases/${RELEASE_NAME}.zip"
echo "  - releases/${RELEASE_NAME}.tar.gz"
echo "  - releases/${RELEASE_NAME}-RELEASE-NOTES.md"
echo ""
echo "📋 Next steps:"
echo "1. Test the release packages"
echo "2. Upload to your distribution platform"
echo "3. Share with users"
echo ""
echo "🔗 Quick test:"
echo "cd releases/$RELEASE_NAME"
echo "chmod +x install.sh && ./install.sh"
echo ""
print_warning "Remember: This is an educational application only!"

# Create checksums for security
print_status "Creating checksums..."
cd releases
if command -v sha256sum &> /dev/null; then
    sha256sum "${RELEASE_NAME}.zip" > "${RELEASE_NAME}.zip.sha256"
    sha256sum "${RELEASE_NAME}.tar.gz" > "${RELEASE_NAME}.tar.gz.sha256"
    print_status "Checksums created for security verification"
fi

echo ""
print_status "Release package creation completed! 🚀"
