const { app, BrowserWindow, Menu, dialog, shell } = require("electron");
const path = require("path");
const { spawn } = require("child_process");
const fs = require("fs");

// Keep a global reference of the window object
let mainWindow;
let backendProcess;

// Enable live reload for Electron in development
if (process.env.NODE_ENV === "development") {
  require("electron-reload")(__dirname, {
    electron: path.join(__dirname, "node_modules", ".bin", "electron"),
    hardResetMethod: "exit",
  });
}

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: true,
    },
    icon: path.join(__dirname, "assets", "icon.png"), // Add your app icon
    show: false, // Don't show until ready
    titleBarStyle: "default",
    title: "WhatsApp Bulk Sender - Educational",
  });

  // Load the app
  const startUrl =
    process.env.NODE_ENV === "development"
      ? "http://localhost:3000"
      : `file://${path.join(__dirname, "frontend", "index.html")}`;

  mainWindow.loadURL(startUrl);

  // Show window when ready to prevent visual flash
  mainWindow.once("ready-to-show", () => {
    mainWindow.show();

    // Open DevTools in development
    if (process.env.NODE_ENV === "development") {
      mainWindow.webContents.openDevTools();
    }
  });

  // Handle window closed
  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  // Prevent navigation to external URLs
  mainWindow.webContents.on("will-navigate", (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);

    if (
      parsedUrl.origin !== "http://localhost:3000" &&
      parsedUrl.origin !== "file://"
    ) {
      event.preventDefault();
    }
  });
}

function startBackend() {
  // Start the backend server
  const backendPath = path.join(__dirname, "backend", "server.js");

  if (fs.existsSync(backendPath)) {
    backendProcess = spawn("node", [backendPath], {
      cwd: path.join(__dirname, "backend"),
      stdio: ["pipe", "pipe", "pipe"],
    });

    backendProcess.stdout.on("data", (data) => {
      console.log(`Backend: ${data}`);
    });

    backendProcess.stderr.on("data", (data) => {
      console.error(`Backend Error: ${data}`);
    });

    backendProcess.on("close", (code) => {
      console.log(`Backend process exited with code ${code}`);
    });

    backendProcess.on("error", (err) => {
      console.error("Failed to start backend process:", err);
      dialog.showErrorBox(
        "Backend Error",
        "Failed to start the backend server. Please check the console for details."
      );
    });
  } else {
    console.error("Backend server file not found");
    dialog.showErrorBox(
      "Backend Error",
      "Backend server file not found. Please ensure the application is properly installed."
    );
  }
}

function createMenu() {
  const template = [
    {
      label: "File",
      submenu: [
        {
          label: "Import Contacts",
          accelerator: "CmdOrCtrl+I",
          click: () => {
            // Trigger import contacts functionality
            mainWindow.webContents.send("import-contacts");
          },
        },
        {
          label: "Export Data",
          accelerator: "CmdOrCtrl+E",
          click: () => {
            // Trigger export functionality
            mainWindow.webContents.send("export-data");
          },
        },
        { type: "separator" },
        {
          label: "Exit",
          accelerator: process.platform === "darwin" ? "Cmd+Q" : "Ctrl+Q",
          click: () => {
            app.quit();
          },
        },
      ],
    },
    {
      label: "Edit",
      submenu: [
        { role: "undo" },
        { role: "redo" },
        { type: "separator" },
        { role: "cut" },
        { role: "copy" },
        { role: "paste" },
        { role: "selectall" },
      ],
    },
    {
      label: "View",
      submenu: [
        { role: "reload" },
        { role: "forceReload" },
        { role: "toggleDevTools" },
        { type: "separator" },
        { role: "resetZoom" },
        { role: "zoomIn" },
        { role: "zoomOut" },
        { type: "separator" },
        { role: "togglefullscreen" },
      ],
    },
    {
      label: "Window",
      submenu: [{ role: "minimize" }, { role: "close" }],
    },
    {
      label: "Help",
      submenu: [
        {
          label: "About WhatsApp Bulk Sender",
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: "info",
              title: "About WhatsApp Bulk Sender",
              message: "WhatsApp Bulk Sender - Educational",
              detail:
                "Version 1.0.0\n\nThis is an educational application designed to demonstrate bulk messaging systems.\n\n⚠️ WARNING: This is for educational purposes only. Do not use for actual bulk messaging or spam.",
              buttons: ["OK"],
            });
          },
        },
        {
          label: "View Documentation",
          click: () => {
            shell.openExternal(
              "https://github.com/yourusername/whatsapp-bulk-sender#readme"
            );
          },
        },
        {
          label: "Report Issue",
          click: () => {
            shell.openExternal(
              "https://github.com/yourusername/whatsapp-bulk-sender/issues"
            );
          },
        },
      ],
    },
  ];

  // macOS specific menu adjustments
  if (process.platform === "darwin") {
    template.unshift({
      label: app.getName(),
      submenu: [
        { role: "about" },
        { type: "separator" },
        { role: "services" },
        { type: "separator" },
        { role: "hide" },
        { role: "hideOthers" },
        { role: "unhide" },
        { type: "separator" },
        { role: "quit" },
      ],
    });

    // Window menu
    template[4].submenu = [
      { role: "close" },
      { role: "minimize" },
      { role: "zoom" },
      { type: "separator" },
      { role: "front" },
    ];
  }

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// App event handlers
app.whenReady().then(() => {
  createWindow();
  createMenu();
  startBackend();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  // Kill backend process
  if (backendProcess) {
    backendProcess.kill();
  }

  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("before-quit", () => {
  // Kill backend process before quitting
  if (backendProcess) {
    backendProcess.kill();
  }
});

// Security: Prevent new window creation
app.on("web-contents-created", (event, contents) => {
  contents.on("new-window", (event, navigationUrl) => {
    event.preventDefault();
    shell.openExternal(navigationUrl);
  });
});

// Handle protocol for deep linking (optional)
app.setAsDefaultProtocolClient("whatsapp-bulk-sender");

// Prevent navigation to external URLs
app.on("web-contents-created", (event, contents) => {
  contents.on("will-navigate", (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);

    if (parsedUrl.origin !== "http://localhost:3000") {
      event.preventDefault();
    }
  });
});
