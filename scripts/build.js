const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

console.log("🔨 Building WhatsApp Bulk Sender...");

// Build steps
const buildSteps = [
  {
    name: "Clean previous builds",
    command: () => {
      const distDir = path.join(__dirname, "..", "dist");
      if (fs.existsSync(distDir)) {
        fs.rmSync(distDir, { recursive: true });
      }
      fs.mkdirSync(distDir, { recursive: true });
    },
  },
  {
    name: "Install dependencies",
    command: () => {
      execSync("npm install", { stdio: "inherit" });
      execSync("cd backend && npm install", { stdio: "inherit" });
    },
  },
  {
    name: "Create directories",
    command: () => {
      const dirs = [
        "logs",
        "uploads",
        "sessions",
        "backend/logs",
        "backend/uploads",
      ];
      dirs.forEach((dir) => {
        const fullPath = path.join(__dirname, "..", dir);
        if (!fs.existsSync(fullPath)) {
          fs.mkdirSync(fullPath, { recursive: true });
        }
      });
    },
  },
  {
    name: "Copy application files",
    command: () => {
      const distDir = path.join(__dirname, "..", "dist");
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

      filesToCopy.forEach((file) => {
        const srcPath = path.join(__dirname, "..", file);
        const destPath = path.join(distDir, file);

        if (fs.existsSync(srcPath)) {
          if (fs.statSync(srcPath).isDirectory()) {
            copyDir(srcPath, destPath);
          } else {
            fs.copyFileSync(srcPath, destPath);
          }
        }
      });
    },
  },
  {
    name: "Create Electron build",
    command: () => {
      try {
        execSync("npm run dist", { stdio: "inherit" });
      } catch (error) {
        console.log(
          "⚠️  Electron build failed, continuing with web version..."
        );
      }
    },
  },
  {
    name: "Create Docker image",
    command: () => {
      try {
        execSync("docker build -t whatsapp-bulk-sender .", {
          stdio: "inherit",
        });
        console.log("✅ Docker image created: whatsapp-bulk-sender");
      } catch (error) {
        console.log("⚠️  Docker build failed, skipping...");
      }
    },
  },
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

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Execute build steps
buildSteps.forEach((step, index) => {
  console.log(`\n[${index + 1}/${buildSteps.length}] ${step.name}...`);
  try {
    step.command();
    console.log(`✅ ${step.name} completed`);
  } catch (error) {
    console.error(`❌ ${step.name} failed:`, error.message);
    process.exit(1);
  }
});

console.log("\n🎉 Build completed successfully!");
console.log("\n📁 Build outputs:");
console.log("- Web application: dist/");
console.log("- Desktop app: dist/ (Electron builds)");
console.log("- Docker image: whatsapp-bulk-sender");

// Create build info
const buildInfo = {
  buildDate: new Date().toISOString(),
  nodeVersion: process.version,
  platform: process.platform,
  arch: process.arch,
  version: JSON.parse(
    fs.readFileSync(path.join(__dirname, "..", "package.json"), "utf8")
  ).version,
};

fs.writeFileSync(
  path.join(__dirname, "..", "dist", "build-info.json"),
  JSON.stringify(buildInfo, null, 2)
);

console.log("\n📋 Next steps:");
console.log("1. Test the build: cd dist && npm start");
console.log("2. Create distribution package: npm run package");
console.log("3. Deploy using Docker: docker-compose up -d");
