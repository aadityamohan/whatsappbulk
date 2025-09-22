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
        
        <div class="form-group" style="margin-top: 20px;">
            <button class="btn btn-danger" onclick="removeInvalidContacts()" id="removeInvalidBtn">
                🗑️ Remove Invalid Contacts
            </button>
            <button class="btn btn-warning" onclick="deleteAllContacts()" id="deleteAllBtn" style="margin-left: 10px;">
                ⚠️ Delete All Contacts
            </button>
            <span id="invalidCount" style="margin-left: 10px; color: #666;"></span>
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
    const data = await window.app.makeAPICall("/contacts?limit=1000");
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

  // Filter out invalid contacts for display
  const validContacts = contacts.filter(
    (contact) => contact.status === "valid" && contact.isWhatsAppValid === true
  );

  // Update invalid count display
  const invalidCount = contacts.filter(
    (contact) =>
      contact.status === "invalid" || contact.isWhatsAppValid === false
  ).length;

  const invalidCountElement = document.getElementById("invalidCount");
  if (invalidCount > 0) {
    invalidCountElement.textContent = `(${invalidCount} invalid contacts will be removed)`;
    invalidCountElement.style.color = "#dc3545";
  } else {
    invalidCountElement.textContent = "";
  }

  if (validContacts.length === 0) {
    listElement.innerHTML =
      '<p style="text-align: center; color: #999;">No valid contacts found</p>';
    return;
  }

  listElement.innerHTML = validContacts
    .map(
      (contact) => `
        <div class="contact-item" id="contact-${contact._id}">
            <div>
                <div style="font-weight: 600;">${contact.name}</div>
                <div style="color: #666; font-size: 14px;">${contact.phone}</div>
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
                <span class="badge badge-success">
                    ${contact.status}
                </span>
                <button class="btn btn-sm btn-danger" onclick="deleteContact('${contact._id}', '${contact.name}')" title="Delete contact">
                    🗑️
                </button>
            </div>
        </div>
    `
    )
    .join("");
}

function updateContactStats(contacts) {
  const total = contacts.length;
  const valid = contacts.filter(
    (c) => c.status === "valid" && c.isWhatsAppValid === true
  ).length;
  const invalid = contacts.filter(
    (c) => c.status === "invalid" || c.isWhatsAppValid === false
  ).length;

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

async function removeInvalidContacts() {
  const button = document.getElementById("removeInvalidBtn");
  const originalText = button.textContent;

  // Show loading state
  button.disabled = true;
  button.textContent = "🔄 Removing...";

  try {
    const result = await window.app.makeAPICall("/contacts/invalid/all", {
      method: "DELETE",
    });

    // Show success popup
    window.app.showNotification(
      `✅ Successfully removed ${result.deletedCount} invalid contacts!`,
      "success"
    );

    // Reload contacts to update the display
    await loadContacts();
  } catch (error) {
    window.app.showNotification("Failed to remove invalid contacts", "error");
    console.error("Error removing invalid contacts:", error);
  } finally {
    // Reset button state
    button.disabled = false;
    button.textContent = originalText;
  }
}

async function deleteContact(contactId, contactName) {
  // Show confirmation dialog
  const confirmed = confirm(
    `Are you sure you want to delete "${contactName}"?\n\nThis action cannot be undone.`
  );

  if (!confirmed) {
    return;
  }

  try {
    // Show loading state on the specific contact
    const contactElement = document.getElementById(`contact-${contactId}`);
    const deleteButton = contactElement.querySelector("button");
    const originalButtonText = deleteButton.innerHTML;
    deleteButton.disabled = true;
    deleteButton.innerHTML = "🔄";

    // Make API call to delete contact
    await window.app.makeAPICall(`/contacts/${contactId}`, {
      method: "DELETE",
    });

    // Small delay to prevent rate limiting
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Show success notification
    window.app.showNotification(
      `✅ Contact "${contactName}" deleted successfully!`,
      "success"
    );

    // Remove contact from UI immediately
    contactElement.style.opacity = "0.5";
    contactElement.style.transition = "opacity 0.3s ease";

    setTimeout(() => {
      contactElement.remove();
      // Reload contacts to update stats
      loadContacts();
    }, 300);
  } catch (error) {
    // Reset button state on error
    const contactElement = document.getElementById(`contact-${contactId}`);
    const deleteButton = contactElement.querySelector("button");
    deleteButton.disabled = false;
    deleteButton.innerHTML = "🗑️";

    // Check if it's a rate limiting error
    if (error.message && error.message.includes("Too Many Requests")) {
      window.app.showNotification(
        "⏳ Too many requests. Please wait a moment and try again.",
        "warning"
      );
    } else {
      window.app.showNotification("Failed to delete contact", "error");
    }
    console.error("Error deleting contact:", error);
  }
}

async function deleteAllContacts() {
  // Show confirmation dialog
  const confirmed = confirm(
    `⚠️ WARNING: Are you sure you want to delete ALL contacts?\n\nThis will permanently remove all contacts from your database.\n\nThis action cannot be undone!`
  );

  if (!confirmed) {
    return;
  }

  const button = document.getElementById("deleteAllBtn");
  const originalText = button.textContent;

  // Show loading state
  button.disabled = true;
  button.textContent = "🔄 Deleting All...";

  try {
    // Use the new bulk delete endpoint - single API call
    const result = await window.app.makeAPICall("/contacts/all", {
      method: "DELETE",
    });

    // Show success notification
    window.app.showNotification(
      `✅ Successfully deleted ${result.deletedCount} contacts!`,
      "success"
    );

    // Reload contacts to update the display
    await loadContacts();
  } catch (error) {
    window.app.showNotification("Failed to delete contacts", "error");
    console.error("Error deleting all contacts:", error);
  } finally {
    // Reset button state
    button.disabled = false;
    button.textContent = originalText;
  }
}
