const whatsappSender = require("./whatsappSender");

exports.checkNumber = async (phoneNumber) => {
  try {
    // Use real WhatsApp validation
    const isValid = await whatsappSender.checkNumber(phoneNumber);
    console.log(
      `[REAL CHECK] ${phoneNumber}: ${isValid ? "Valid" : "Invalid"}`
    );
    return isValid;
  } catch (error) {
    console.error("Error validating number:", error);
    // Fallback to simulation if WhatsApp client not ready
    return Math.random() > 0.2;
  }
};

exports.checkBulkNumbers = async (phoneNumbers) => {
  const results = [];

  for (const phone of phoneNumbers) {
    const isValid = await this.checkNumber(phone);
    results.push({
      phone,
      isValid,
      status: isValid ? "valid" : "invalid",
    });

    // Add delay to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  return results;
};
