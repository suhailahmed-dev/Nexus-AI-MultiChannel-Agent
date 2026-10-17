const agentService = require('../services/agentService');
const sheetsService = require('../services/sheetsService');

class WhatsAppAdapter {
  // Webhook verification endpoint for Meta WhatsApp Cloud API
  verifyWebhook(req, res) {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'nexus_secret_token';

    if (mode && token) {
      if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        console.log('WhatsApp Webhook Verified Successfully');
        return res.status(200).send(challenge);
      } else {
        return res.sendStatus(403);
      }
    }
    return res.sendStatus(400);
  }

  // Handle incoming messages from WhatsApp Cloud API
  async handleIncomingMessage(req, res) {
    const body = req.body;

    if (body.object) {
      if (
        body.entry &&
        body.entry[0].changes &&
        body.entry[0].changes[0].value.messages &&
        body.entry[0].changes[0].value.messages[0]
      ) {
        const message = body.entry[0].changes[0].value.messages[0];
        const from = message.from; // Sender WhatsApp Number
        const clientId = req.params.clientId || 'fashion-pk';

        let incomingText = '';

        if (message.type === 'text') {
          incomingText = message.text.body;
        } else if (message.type === 'audio' || message.type === 'voice') {
          // Voice note detected!
          incomingText = "[Voice Note Received: Customer asked about prices and orders]";
        }

        if (incomingText) {
          const result = await agentService.processMessage(clientId, from, incomingText);

          // If lead captured, trigger Google Sheets sync
          if (result.leadCaptured) {
            sheetsService.syncLeadToSheets(result.leadCaptured);
          }

          console.log(`WhatsApp Reply to ${from}: ${result.reply}`);
        }
      }
      return res.status(200).send('EVENT_RECEIVED');
    }

    return res.sendStatus(404);
  }
}

module.exports = new WhatsAppAdapter();
