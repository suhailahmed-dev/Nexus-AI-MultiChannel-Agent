const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'nexus_data.json');

// Default starter templates for instant 7-day trials
const DEFAULT_CLIENTS = [
  {
    id: "fashion-pk",
    name: "Zahra Luxury Pret & Lawn",
    niche: "fashion",
    country: "Pakistan",
    currency: "PKR",
    whatsapp_number: "+92 300 1234567",
    trial_start: new Date().toISOString(),
    trial_end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: "active",
    system_prompt: `Aap Zahra Luxury Pret ke top-tier AI Sales Representative hain.
Zuban: Friendly, polite, aur natural Roman Urdu / Urdu (ya customer jis zuban mein baat kare).
Products & Pricing:
- 3-Piece Stitched Festive Lawn: Rs. 6,500 (Sizes: S, M, L, XL)
- Chiffon Luxury Embroidered Suit: Rs. 9,800 (Sizes: S, M, L)
- Silk Ready-to-Wear Kurti: Rs. 3,800
Delivery & Payment:
- Cash on Delivery (COD) pore Pakistan mein available hai. Delivery time: 3 se 4 working days. Delivery charges: Rs. 250 (Rs. 5,000 se upar free delivery!).
- Return/Exchange Policy: 7 days easy exchange policy agar size ka issue ho.
Goal: Customer ko khush dilli se guide karna, unki pasand/size poochna, aur order lene ke liye unka Naam, Phone Number aur Delivery Address lena.`,
    created_at: new Date().toISOString()
  },
  {
    id: "realestate-dxb",
    name: "Elysian Luxe Properties Dubai",
    niche: "real_estate",
    country: "UAE",
    currency: "AED",
    whatsapp_number: "+971 50 9876543",
    trial_start: new Date().toISOString(),
    trial_end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: "active",
    system_prompt: `You are an elite, professional Real Estate Advisor at Elysian Luxe Properties Dubai.
Language: Sophisticated, polite English (or Arabic / Roman Urdu if requested).
Inventory Highlights:
- Downtown Dubai Luxury 1 & 2 Bed Apartments (Starting from AED 1.8M, 60/40 payment plan).
- Palm Jumeirah Ultra-Luxury Waterfront Villas (Starting from AED 14M).
- Dubai Marina High-ROI Off-Plan Units (Expected 8.5% Net ROI).
Investor Perks: UAE Golden Visa assistance on purchases above AED 2M.
Goal: Qualify the investor (budget range, cash or finance, preferred move-in date) and schedule a private 1-on-1 Zoom or in-person VIP consultation. Collect their Full Name, Phone/WhatsApp, and Email.`,
    created_at: new Date().toISOString()
  },
  {
    id: "dental-uk",
    name: "Harley Street Smiles Clinic London",
    niche: "healthcare",
    country: "UK",
    currency: "GBP",
    whatsapp_number: "+44 20 7946 0123",
    trial_start: new Date().toISOString(),
    trial_end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: "active",
    system_prompt: `You are the welcoming, empathetic AI Patient Coordinator for Harley Street Smiles Clinic London.
Language: Warm, professional British English.
Services:
- Invisalign Teeth Straightening (From £2,400 with 0% interest monthly financing from £99/mo).
- Composite Bonding & Smile Makeover (£250 per tooth).
- Professional Laser Teeth Whitening (£350 special offer).
- Emergency Dental Appointments (Same day slots available from £95).
Goal: Address patient concerns gently, explain payment options, and book an in-clinic consultation. Collect Patient Name, Contact Number, Preferred Date/Time, and Main Concern.`,
    created_at: new Date().toISOString()
  }
];

class Database {
  constructor() {
    this.init();
  }

  init() {
    if (!fs.existsSync(DB_FILE)) {
      const initialData = {
        clients: DEFAULT_CLIENTS,
        leads: [],
        conversations: [],
        settings: {
          agency_name: "Nexus AI Agency",
          google_sheets_webhook: ""
        }
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
    }
  }

  read() {
    try {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(raw);
    } catch (e) {
      console.error("DB Read Error:", e);
      return { clients: [], leads: [], conversations: [], settings: {} };
    }
  }

  write(data) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  }

  // Clients
  getClients() {
    const data = this.read();
    const now = new Date();
    // Update trial statuses automatically
    return data.clients.map(client => {
      const trialEnd = new Date(client.trial_end);
      const isExpired = now > trialEnd;
      const daysLeft = Math.max(0, Math.ceil((trialEnd - now) / (1000 * 60 * 60 * 24)));
      return {
        ...client,
        is_expired: isExpired,
        days_left: daysLeft
      };
    });
  }

  getClient(id) {
    const clients = this.getClients();
    return clients.find(c => c.id === id);
  }

  createClient(clientData) {
    const data = this.read();
    const now = new Date();
    const newClient = {
      id: clientData.id || `client-${Date.now()}`,
      name: clientData.name,
      niche: clientData.niche || 'general',
      country: clientData.country || 'Pakistan',
      currency: clientData.currency || 'PKR',
      whatsapp_number: clientData.whatsapp_number || '+92 300 0000000',
      trial_start: now.toISOString(),
      trial_end: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active',
      system_prompt: clientData.system_prompt,
      created_at: now.toISOString()
    };
    data.clients.push(newClient);
    this.write(data);
    return newClient;
  }

  // Leads
  getLeads(clientId = null) {
    const data = this.read();
    if (clientId) {
      return data.leads.filter(l => l.client_id === clientId);
    }
    return data.leads;
  }

  saveLead(lead) {
    const data = this.read();
    const newLead = {
      id: `lead-${Date.now()}`,
      client_id: lead.client_id,
      customer_name: lead.customer_name || 'Anonymous Visitor',
      customer_phone: lead.customer_phone || 'N/A',
      customer_email: lead.customer_email || 'N/A',
      intent: lead.intent || 'General Inquiry',
      urgency: lead.urgency || 'Medium',
      summary: lead.summary || '',
      requires_human: lead.requires_human || false,
      appointment: lead.appointment || null,
      created_at: new Date().toISOString()
    };
    data.leads.unshift(newLead);
    this.write(data);
    return newLead;
  }

  // Conversations
  getConversation(clientId, sessionId) {
    const data = this.read();
    return data.conversations.filter(c => c.client_id === clientId && c.session_id === sessionId);
  }

  saveMessage(clientId, sessionId, role, text) {
    const data = this.read();
    const msg = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      client_id: clientId,
      session_id: sessionId,
      role: role,
      text: text,
      timestamp: new Date().toISOString()
    };
    data.conversations.push(msg);
    this.write(data);
    return msg;
  }

  // Settings
  getSettings() {
    return this.read().settings || {};
  }

  updateSettings(settings) {
    const data = this.read();
    data.settings = { ...data.settings, ...settings };
    this.write(data);
    return data.settings;
  }
}

module.exports = new Database();
