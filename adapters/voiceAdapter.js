const db = require('../database/db');
const agentService = require('../services/agentService');
const sheetsService = require('../services/sheetsService');

class VoiceAdapter {
  // Webhook for Voice AI providers (Vapi.ai, Retell AI, Twilio, Bland.ai)
  async handleVoiceWebhook(req, res) {
    const payload = req.body;
    const clientId = req.params.clientId || 'dental-uk';

    console.log(`[Voice Webhook Received] Client: ${clientId}`, JSON.stringify(payload, null, 2));

    // Support standard Vapi / Retell end-of-call report structure
    let callerNumber = 'N/A';
    let transcript = '';
    let summary = '';
    let customerName = 'Caller';

    if (payload.message && payload.message.type === 'end-of-call-report') {
      const call = payload.message.call;
      callerNumber = call?.customer?.number || 'N/A';
      transcript = payload.message.transcript || '';
      summary = payload.message.summary || '';
    } else if (payload.transcript) {
      transcript = payload.transcript;
      callerNumber = payload.caller_id || payload.phone || 'N/A';
      summary = payload.summary || '';
    }

    if (transcript) {
      // Analyze the voice transcript for booking details
      const analysis = agentService.simulateIntelligentResponse(
        db.getClient(clientId) || { country: 'UK', niche: 'healthcare' },
        transcript
      );

      const savedLead = db.saveLead({
        client_id: clientId,
        customer_name: analysis.lead.customer_name !== 'Anonymous Visitor' ? analysis.lead.customer_name : customerName,
        customer_phone: callerNumber !== 'N/A' ? callerNumber : analysis.lead.customer_phone,
        customer_email: analysis.lead.customer_email,
        intent: "Voice Call: " + analysis.lead.intent,
        urgency: analysis.lead.urgency,
        summary: summary || analysis.lead.summary || "Voice consultation completed.",
        requires_human: analysis.lead.requires_human
      });

      sheetsService.syncLeadToSheets(savedLead);
      return res.status(200).json({ success: true, lead_id: savedLead.id });
    }

    return res.status(200).json({ received: true });
  }

  // Voice Assistant response endpoint for interactive browser voice simulation
  async handleBrowserVoiceExchange(req, res) {
    try {
      const { clientId, sessionId, transcript } = req.body;
      const client = db.getClient(clientId);

      if (!client) {
        return res.status(404).json({ error: "Client not found" });
      }

      // Generate conversational AI response
      const result = await agentService.processMessage(clientId, sessionId, transcript);

      res.json({
        replyText: result.reply,
        leadCaptured: result.leadCaptured
      });
    } catch (e) {
      console.error("Browser Voice Exchange Error:", e);
      res.status(500).json({ error: e.message });
    }
  }
}

module.exports = new VoiceAdapter();
