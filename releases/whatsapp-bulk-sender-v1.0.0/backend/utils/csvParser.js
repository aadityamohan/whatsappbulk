const fs = require("fs");
const csv = require("csv-parser");
const path = require("path");

exports.parseCSV = (filePath) => {
  return new Promise((resolve, reject) => {
    const results = [];

    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (data) => {
        // Clean and validate data
        const cleaned = {
          name: data.name || data.Name || data.NAME || "Unknown",
          phone: this.cleanPhoneNumber(
            data.phone || data.Phone || data.PHONE || ""
          ),
          email: data.email || data.Email || data.EMAIL || "",
          groups: data.groups
            ? data.groups.split(",").map((g) => g.trim())
            : [],
        };

        if (cleaned.phone) {
          results.push(cleaned);
        }
      })
      .on("end", () => {
        // Delete uploaded file after parsing
        fs.unlinkSync(filePath);
        resolve(results);
      })
      .on("error", reject);
  });
};

exports.cleanPhoneNumber = (phone) => {
  // Remove all non-numeric characters except +
  let cleaned = phone.replace(/[^\d+]/g, "");

  // Add + if not present
  if (!cleaned.startsWith("+")) {
    cleaned = "+" + cleaned;
  }

  return cleaned;
};
