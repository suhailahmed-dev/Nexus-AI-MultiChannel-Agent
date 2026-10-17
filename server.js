const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const db = require('./database/db');
const agentService = require('./services/agentService');
const sheetsService = require('./services/sheetsService');
const whatsappAdapter = require('./adapters/whatsappAdapter');
const voiceAdapter = require('./adapters/voiceAdapter');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Initialize DB
db.init();

// --- API ROUTES ---

// 1. Get all clients (with 7-day trial calculation)
app.get('/api/clients', (req, res) => {
  const clients = db.getClients();
  res.json(clients);
});

// 2. Get single client
app.get('/api/clients/:id', (req, res) => {
  const client = db.getClient(req.params.id);
  if (!client) return res.status(404).json({ error: "Client not found" });
  res.json(client);
});

// 3. Create a new 7-Day Trial Client
app.post('/api/clients', (req, res) => {
  const newClient = db.createClient(req.body);
  res.status(201).json(newClient);
});

// 4. Get Captured Leads
app.get('/api/leads', (req, res) => {
  const clientId = req.query.clientId || null;
  const leads = db.getLeads(clientId);
  res.json(leads);
});

// 5. Main AI Conversational Chat Endpoint (Used by Web Widget & Simulator)
app.post('/api/chat', async (req, res) => {
  try {
    const { clientId, sessionId, message } = req.body;
    if (!clientId || !message) {
      return res.status(400).json({ error: "clientId and message are required" });
    }

    const sess = sessionId || 'default-session';
    const result = await agentService.processMessage(clientId, sess, message);

    // If a new lead is captured and Google Sheets webhook is configured, sync it
    if (result.leadCaptured) {
      sheetsService.syncLeadToSheets(result.leadCaptured);
    }

    res.json(result);
  } catch (err) {
    console.error("Chat Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// 6. Settings
app.get('/api/settings', (req, res) => {
  res.json(db.getSettings());
});

app.post('/api/settings', (req, res) => {
  const { gemini_api_key, google_sheets_webhook } = req.body;
  if (gemini_api_key) {
    agentService.setApiKey(gemini_api_key);
  }
  const updated = db.updateSettings({ google_sheets_webhook });
  res.json(updated);
});

// 7. WhatsApp Webhook Routes
app.get('/api/whatsapp/webhook/:clientId', (req, res) => whatsappAdapter.verifyWebhook(req, res));
app.post('/api/whatsapp/webhook/:clientId', (req, res) => whatsappAdapter.handleIncomingMessage(req, res));

// 8. Voice Calling Routes (Browser Voice Simulator & Vapi/Retell Webhooks)
app.post('/api/voice/chat', (req, res) => voiceAdapter.handleBrowserVoiceExchange(req, res));
app.post('/api/voice/webhook/:clientId', (req, res) => voiceAdapter.handleVoiceWebhook(req, res));

// 8. Lead Export Webhook Test
app.post('/api/leads/:id/sync', async (req, res) => {
  const leads = db.getLeads();
  const lead = leads.find(l => l.id === req.params.id);
  if (!lead) return res.status(404).json({ error: "Lead not found" });

  const result = await sheetsService.syncLeadToSheets(lead);
  res.json(result);
});

// Start Server
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 NEXUS AI AGENT ENGINE is running!`);
  console.log(`📊 Agency Command Center: http://localhost:${PORT}`);
  console.log(`📱 WhatsApp Live Demo:   http://localhost:${PORT}/demo-lab.html?client=fashion-pk`);
  console.log(`====================================================`);
});
