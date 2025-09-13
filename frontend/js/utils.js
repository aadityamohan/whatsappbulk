// Utility functions
function formatDate(date) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function initStatsSection() {
  const section = document.getElementById("statsSection");
  section.innerHTML = `
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-value" id="totalMessages">0</div>
                <div class="stat-label">Total Messages</div>
            </div>
            <div class="stat-card">
                <div class="stat-value" id="sentMessages">0</div>
                <div class="stat-label">Sent</div>
            </div>
            <div class="stat-card">
                <div class="stat-value" id="failedMessages">0</div>
                <div class="stat-label">Failed</div>
            </div>
            <div class="stat-card">
                <div class="stat-value" id="successRate">0%</div>
                <div class="stat-label">Success Rate</div>
            </div>
        </div>
    `;

  loadMessageStats();
}

async function loadMessageStats() {
  try {
    const data = await window.app.makeAPICall("/messages");
    updateMessageStats(data.messages);
  } catch (error) {
    console.error("Failed to load message stats:", error);
  }
}

function updateMessageStats(messages) {
  const total = messages.length;
  const sent = messages.filter((m) => m.status === "sent").length;
  const failed = messages.filter((m) => m.status === "failed").length;
  const successRate = total > 0 ? Math.round((sent / total) * 100) : 0;

  document.getElementById("totalMessages").textContent = total;
  document.getElementById("sentMessages").textContent = sent;
  document.getElementById("failedMessages").textContent = failed;
  document.getElementById("successRate").textContent = successRate + "%";
}
