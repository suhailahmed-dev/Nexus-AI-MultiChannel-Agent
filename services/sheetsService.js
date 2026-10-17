const db = require('../database/db');

class SheetsService {
  async syncLeadToSheets(lead) {
    const settings = db.getSettings();
    const webhookUrl = settings.google_sheets_webhook;

    if (!webhookUrl) {
      // No webhook configured yet, skip silently
      return { success: false, reason: "No webhook URL configured" };
    }

    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lead_id: lead.id,
          client_id: lead.client_id,
          customer_name: lead.customer_name,
          customer_phone: lead.customer_phone,
          customer_email: lead.customer_email,
          intent: lead.intent,
          urgency: lead.urgency,
          summary: lead.summary,
          requires_human: lead.requires_human ? "YES (ATTENTION)" : "NO",
          created_at: lead.created_at
        })
      });

      return { success: response.ok };
    } catch (e) {
      console.error("Sheets Webhook Sync Failed:", e.message);
      return { success: false, error: e.message };
    }
  }
}

module.exports = new SheetsService();
