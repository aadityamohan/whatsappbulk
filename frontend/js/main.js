// Main application initialization
const API_URL = "http://localhost:3000/api";

// Application state
const appState = {
  contacts: [],
  messages: [],
  currentPage: 1,
  isLoading: false,
  sendingInProgress: false,
};

// Initialize application
document.addEventListener("DOMContentLoaded", () => {
  console.log("WhatsApp Bulk Sender - Educational Version");
  console.log("⚠️ This is for educational purposes only!");

  initializeApp();
  loadContacts();
  setupEventListeners();
});

function initializeApp() {
  const app = document.getElementById("app");
  app.innerHTML = `
        <div class="container">
            <div class="header">
                <h1>📱 WhatsApp Bulk Sender - Educational</h1>
                <p>Learn how bulk messaging systems work</p>
            </div>
            
            <div class="warning-banner">
                ⚠️ EDUCATIONAL DEMO - Do not use for actual bulk messaging
            </div>
            
            <div class="main-grid">
                <div class="card">
                    <div class="card-header">
                        <h2 class="card-title">📋 Contacts</h2>
                    </div>
                    <div id="contactsSection"></div>
                </div>
                
                <div class="card">
                    <div class="card-header">
                        <h2 class="card-title">✉️ Messages</h2>
                    </div>
                    <div id="messagesSection"></div>
                </div>
            </div>
            
            <div class="card" style="margin-top: 20px;">
                <div class="card-header">
                    <h2 class="card-title">📊 Statistics</h2>
                </div>
                <div id="statsSection"></div>
            </div>
        </div>
    `;

  // Initialize sections
  initContactsSection();
  initMessagesSection();
  initStatsSection();
}

function setupEventListeners() {
  // Global event listeners
  document.addEventListener("dragover", (e) => e.preventDefault());
  document.addEventListener("drop", (e) => e.preventDefault());
}

async function makeAPICall(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("API Call Failed:", error);
    showNotification("API Error: " + error.message, "error");
    throw error;
  }
}

function showNotification(message, type = "info") {
  const notification = document.createElement("div");
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${
          type === "error"
            ? "#dc3545"
            : type === "success"
            ? "#28a745"
            : "#17a2b8"
        };
        color: white;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, 5000);
}

// Export for use in other modules
window.app = {
  state: appState,
  makeAPICall,
  showNotification,
};
