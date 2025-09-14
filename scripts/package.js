const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

console.log("📦 Creating distribution package...");

// Create dist directory
const distDir = path.join(__dirname, "..", "dist");
if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true });
}
fs.mkdirSync(distDir, { recursive: true });

// Copy necessary files
const filesToCopy = [
  "backend",
  "frontend",
  "package.json",
  "env.example",
  "README.md",
  "LICENSE",
  "install.sh",
  "install.bat",
  "docker-compose.yml",
  "Dockerfile",
  "mongo-init.js",
  "healthcheck.js",
];

// Helper function to copy directories
function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    // Skip problematic files and directories
    if (
      entry.name === "node_modules" ||
      entry.name === ".git" ||
      entry.name === "dist" ||
      entry.name === "logs" ||
      entry.name === "uploads" ||
      entry.name === "sessions" ||
      entry.name.includes(".local-chromium") ||
      entry.name.includes("Chromium.app") ||
      entry.name === ".DS_Store"
    ) {
      continue;
    }

    try {
      if (entry.isDirectory()) {
        copyDir(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    } catch (error) {
      console.log(`⚠️  Skipped problematic file: ${srcPath}`);
    }
  }
}

console.log("📋 Copying files...");
filesToCopy.forEach((file) => {
  const srcPath = path.join(__dirname, "..", file);
  const destPath = path.join(distDir, file);

  if (fs.existsSync(srcPath)) {
    if (fs.statSync(srcPath).isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
    console.log(`✅ Copied: ${file}`);
  } else {
    console.log(`⚠️  Not found: ${file}`);
  }
});

// Create installation instructions
const installInstructions = `
# WhatsApp Bulk Sender - Installation Instructions

## Quick Start

### Option 1: Automated Installation (Recommended)

**For Linux/macOS:**
\`\`\`bash
chmod +x install.sh
./install.sh
\`\`\`

**For Windows:**
\`\`\`
install.bat
\`\`\`

### Option 2: Manual Installation

1. **Install Prerequisites:**
   - Node.js 18 or higher
   - MongoDB
   - npm

2. **Install Dependencies:**
   \`\`\`bash
   npm run install-all
   \`\`\`

3. **Setup Environment:**
   \`\`\`bash
   cp env.example .env
   # Edit .env file with your settings
   \`\`\`

4. **Start MongoDB:**
   \`\`\`bash
   mongod
   \`\`\`

5. **Start Application:**
   \`\`\`bash
   npm start
   \`\`\`

6. **Access Application:**
   Open http://localhost:3000 in your browser

### Option 3: Docker Installation

1. **Install Docker and Docker Compose**

2. **Start with Docker Compose:**
   \`\`\`bash
   docker-compose up -d
   \`\`\`

3. **Access Application:**
   Open http://localhost:3000 in your browser

## Desktop Application

To create a desktop application:

\`\`\`bash
npm run dist
\`\`\`

This will create installers for your operating system in the \`dist\` folder.

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
`;

fs.writeFileSync(path.join(distDir, "INSTALL.md"), installInstructions);

// Create version info
const packageJson = JSON.parse(
  fs.readFileSync(path.join(__dirname, "..", "package.json"), "utf8")
);
const versionInfo = {
  name: packageJson.name,
  version: packageJson.version,
  description: packageJson.description,
  buildDate: new Date().toISOString(),
  nodeVersion: process.version,
  platform: process.platform,
  arch: process.arch,
};

fs.writeFileSync(
  path.join(distDir, "version.json"),
  JSON.stringify(versionInfo, null, 2)
);

console.log("✅ Package created successfully!");
console.log(`📁 Package location: ${distDir}`);
console.log("📋 Next steps:");
console.log("1. Test the package by extracting it to a new location");
console.log("2. Run the installation script");
console.log("3. Start the application");
