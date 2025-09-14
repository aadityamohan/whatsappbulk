// Messages management module
function initMessagesSection() {
  const section = document.getElementById("messagesSection");
  section.innerHTML = `
        <div class="form-group">
            <label class="form-label">Message Template</label>
            <select class="form-control" id="templateSelect" onchange="loadTemplate()">
                <option value="">Custom Message</option>
            </select>
        </div>
        
        <div class="form-group">
            <label class="form-label">Message Content</label>
            <textarea class="form-control" id="messageContent" rows="6" 
                placeholder="Type your message here...&#10;&#10;Variables:&#10;{{name}} - Contact name&#10;{{phone}} - Phone number"></textarea>
            <div style="text-align: right; color: #666; font-size: 12px; margin-top: 5px;">
                <span id="charCount">0</span> / 4096 characters
            </div>
        </div>
        
        <div class="form-group">
            <label class="form-label">Send Delay (seconds)</label>
            <input type="number" class="form-control" id="sendDelay" value="10" min="5" max="60">
        </div>
        
        <div style="display: flex; gap: 10px;">
            <button class="btn btn-primary" onclick="validateMessage()">Validate</button>
            <button class="btn btn-success" onclick="sendBulkMessages()">Send to All Valid</button>
            <button class="btn btn-danger" onclick="stopSending()">Stop</button>
        </div>
        
        <div class="progress" id="progressBar" style="display: none; margin-top: 20px;">
            <div class="progress-bar" id="progressFill" style="width: 0%">0%</div>
        </div>
        
        <div id="messageLog" style="margin-top: 20px;">
            <!-- Message log will appear here -->
        </div>
    `;

  loadTemplates();
  setupMessageHandlers();
}

function setupMessageHandlers() {
  const messageContent = document.getElementById("messageContent");
  messageContent.addEventListener("input", () => {
    document.getElementById("charCount").textContent =
      messageContent.value.length;
  });
}

async function loadTemplates() {
  try {
    const templates = await window.app.makeAPICall("/messages/templates");
    const select = document.getElementById("templateSelect");

    templates.forEach((template) => {
      const option = document.createElement("option");
      option.value = template.id;
      option.textContent = template.name;
      option.dataset.content = template.content;
      select.appendChild(option);
    });
  } catch (error) {
    console.error("Failed to load templates:", error);
  }
}

function loadTemplate() {
  const select = document.getElementById("templateSelect");
  const selected = select.options[select.selectedIndex];

  if (selected.dataset.content) {
    document.getElementById("messageContent").value = selected.dataset.content;
    document.getElementById("charCount").textContent =
      selected.dataset.content.length;
  }
}

function validateMessage() {
  const message = document.getElementById("messageContent").value;

  if (!message) {
    window.app.showNotification("Please enter a message", "error");
    return;
  }

  const validContacts = window.app.state.contacts.filter(
    (c) => c.status === "valid"
  );

  if (validContacts.length === 0) {
    window.app.showNotification("No valid contacts available", "error");
    return;
  }

  window.app.showNotification(
    `Message validated! Ready to send to ${validContacts.length} contacts`,
    "success"
  );
}

async function sendBulkMessages() {
  const message = document.getElementById("messageContent").value;
  const delay = document.getElementById("sendDelay").value;

  if (!message) {
    window.app.showNotification("Please enter a message", "error");
    return;
  }

  const validContacts = window.app.state.contacts.filter(
    (c) => c.status === "valid"
  );

  if (validContacts.length === 0) {
    window.app.showNotification("No valid contacts available", "error");
    return;
  }

  if (!confirm(`Send message to ${validContacts.length} contacts?`)) {
    return;
  }

  try {
    window.app.state.sendingInProgress = true;
    document.getElementById("progressBar").style.display = "block";

    const contactIds = validContacts.map((c) => c._id);

    const response = await window.app.makeAPICall("/messages/send-bulk", {
      method: "POST",
      body: JSON.stringify({
        message,
        contactIds,
        delay: parseInt(delay),
      }),
    });

    window.app.showNotification(response.message, "success");
    simulateProgress(validContacts.length, delay);
  } catch (error) {
    window.app.state.sendingInProgress = false;
    window.app.showNotification("Failed to send messages", "error");
  }
}

function simulateProgress(total, delay) {
  let sent = 0;
  const progressFill = document.getElementById("progressFill");

  const interval = setInterval(() => {
    if (!window.app.state.sendingInProgress || sent >= total) {
      clearInterval(interval);
      window.app.state.sendingInProgress = false;

      if (sent >= total) {
        window.app.showNotification(
          `Completed! ${sent} messages sent`,
          "success"
        );
      }
      return;
    }

    sent++;
    const progress = (sent / total) * 100;
    progressFill.style.width = progress + "%";
    progressFill.textContent = Math.round(progress) + "%";
  }, delay * 1000);
}

function stopSending() {
  window.app.state.sendingInProgress = false;
  window.app.showNotification("Sending stopped", "warning");
}
