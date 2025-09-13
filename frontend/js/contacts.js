// Contacts management module
function initContactsSection() {
  const section = document.getElementById("contactsSection");
  section.innerHTML = `
        <div class="upload-area" id="uploadArea">
            <div style="font-size: 48px;">📁</div>
            <h3>Drop CSV file here or click to browse</h3>
            <p>Format: name, phone, email</p>
            <input type="file" id="csvFile" accept=".csv" style="display: none;">
        </div>
        
        <div class="form-group" style="margin-top: 20px;">
            <label class="form-label">Quick Add Contact</label>
            <div style="display: flex; gap: 10px;">
                <input type="text" class="form-control" id="quickName" placeholder="Name">
                <input type="tel" class="form-control" id="quickPhone" placeholder="+1234567890">
                <button class="btn btn-primary" onclick="addQuickContact()">Add</button>
            </div>
        </div>
        
        <div class="form-group">
            <label class="form-label">Validate Number</label>
            <div style="display: flex; gap: 10px;">
                <input type="tel" class="form-control" id="validatePhone" placeholder="+1234567890">
                <button class="btn btn-warning" onclick="validatePhoneNumber()">Check</button>
            </div>
        </div>
        
        <div class="stats-grid" id="contactStats">
            <div class="stat-card">
                <div class="stat-value">0</div>
                <div class="stat-label">Total</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">0</div>
                <div class="stat-label">Valid</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">0</div>
                <div class="stat-label">Invalid</div>
            </div>
        </div>
        
        <h3 style="margin-top: 20px;">Contact List</h3>
        <div class="contact-list" id="contactList">
            <p style="text-align: center; color: #999;">No contacts loaded</p>
        </div>
    `;

  setupUploadHandlers();
}

function setupUploadHandlers() {
  const uploadArea = document.getElementById("uploadArea");
  const fileInput = document.getElementById("csvFile");

  uploadArea.addEventListener("click", () => fileInput.click());

  uploadArea.addEventListener("dragover", (e) => {
    e.preventDefault();
    uploadArea.classList.add("dragover");
  });

  uploadArea.addEventListener("dragleave", () => {
    uploadArea.classList.remove("dragover");
  });

  uploadArea.addEventListener("drop", (e) => {
    e.preventDefault();
    uploadArea.classList.remove("dragover");

    const file = e.dataTransfer.files[0];
    if (file && file.type === "text/csv") {
      uploadCSV(file);
    }
  });

  fileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      uploadCSV(file);
    }
  });
}

async function uploadCSV(file) {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetch(`${API_URL}/contacts/upload`, {
      method: "POST",
      body: formData,
    });

    const result = await response.json();
    window.app.showNotification(
      `CSV uploaded: ${result.results.success} contacts added`,
      "success"
    );
    loadContacts();
  } catch (error) {
    window.app.showNotification("Failed to upload CSV", "error");
  }
}

async function loadContacts() {
  try {
    const data = await window.app.makeAPICall("/contacts");
    window.app.state.contacts = data.contacts;
    updateContactsList(data.contacts);
    updateContactStats(data.contacts);
  } catch (error) {
    console.error("Failed to load contacts:", error);
  }
}

function updateContactsList(contacts) {
  const listElement = document.getElementById("contactList");

  if (contacts.length === 0) {
    listElement.innerHTML =
      '<p style="text-align: center; color: #999;">No contacts loaded</p>';
    return;
  }

  listElement.innerHTML = contacts
    .map(
      (contact) => `
        <div class="contact-item">
            <div>
                <div style="font-weight: 600;">${contact.name}</div>
                <div style="color: #666; font-size: 14px;">${
                  contact.phone
                }</div>
            </div>
            <span class="badge badge-${
              contact.status === "valid" ? "success" : "danger"
            }">
                ${contact.status}
            </span>
        </div>
    `
    )
    .join("");
}

function updateContactStats(contacts) {
  const total = contacts.length;
  const valid = contacts.filter((c) => c.status === "valid").length;
  const invalid = total - valid;

  document.querySelector(
    "#contactStats .stat-card:nth-child(1) .stat-value"
  ).textContent = total;
  document.querySelector(
    "#contactStats .stat-card:nth-child(2) .stat-value"
  ).textContent = valid;
  document.querySelector(
    "#contactStats .stat-card:nth-child(3) .stat-value"
  ).textContent = invalid;
}

async function addQuickContact() {
  const name = document.getElementById("quickName").value;
  const phone = document.getElementById("quickPhone").value;

  if (!name || !phone) {
    window.app.showNotification("Please enter name and phone", "error");
    return;
  }

  try {
    await window.app.makeAPICall("/contacts", {
      method: "POST",
      body: JSON.stringify({ name, phone }),
    });

    window.app.showNotification("Contact added successfully", "success");
    document.getElementById("quickName").value = "";
    document.getElementById("quickPhone").value = "";
    loadContacts();
  } catch (error) {
    window.app.showNotification("Failed to add contact", "error");
  }
}

async function validatePhoneNumber() {
  const phone = document.getElementById("validatePhone").value;

  if (!phone) {
    window.app.showNotification("Please enter a phone number", "error");
    return;
  }

  try {
    const result = await window.app.makeAPICall(
      `/contacts/validate/${encodeURIComponent(phone)}`
    );
    window.app.showNotification(
      `Number ${phone} is ${result.isValid ? "valid ✅" : "invalid ❌"}`,
      result.isValid ? "success" : "error"
    );
  } catch (error) {
    window.app.showNotification("Failed to validate number", "error");
  }
}
