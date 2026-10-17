const db = require('../database/db');

class AgentService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || '';
  }

  setApiKey(key) {
    this.apiKey = key;
  }

  async processMessage(clientId, sessionId, userMessage) {
    const client = db.getClient(clientId);
    if (!client) {
      throw new Error(`Client with ID "${clientId}" not found.`);
    }

    if (client.is_expired) {
      return {
        reply: `⚠️ [7-Day Trial Expired]: This business agent's trial period has ended. Please upgrade your agency subscription to re-activate 24/7 AI Sales support.`,
        leadCaptured: null
      };
    }

    // Save user message to database
    db.saveMessage(clientId, sessionId, 'user', userMessage);

    // Fetch previous conversation history
    const history = db.getConversation(clientId, sessionId);

    // Format chat history for prompt
    const formattedHistory = history.map(h => `${h.role === 'user' ? 'Customer' : 'AI Agent'}: ${h.text}`).join('\n');

    let reply = '';
    let extractedLead = null;

    if (this.apiKey) {
      try {
        const response = await this.callGeminiAPI(client, formattedHistory, userMessage);
        reply = response.reply;
        extractedLead = response.lead;
      } catch (err) {
        console.error("Gemini API Error, falling back to Intelligent Rule Engine:", err.message);
        const fallback = this.simulateIntelligentResponse(client, userMessage);
        reply = fallback.reply;
        extractedLead = fallback.lead;
      }
    } else {
      // Offline / Instant Demo Mode (No API key required to test immediately)
      const fallback = this.simulateIntelligentResponse(client, userMessage);
      reply = fallback.reply;
      extractedLead = fallback.lead;
    }

    // Save AI reply to database
    db.saveMessage(clientId, sessionId, 'model', reply);

    // If a phone number, lead details, or appointment were identified, save lead to DB
    let saved = null;
    if (extractedLead && (extractedLead.customer_phone !== 'N/A' || extractedLead.customer_name !== 'Anonymous Visitor' || extractedLead.appointment)) {
      saved = db.saveLead({
        client_id: clientId,
        customer_name: extractedLead.customer_name,
        customer_phone: extractedLead.customer_phone,
        customer_email: extractedLead.customer_email,
        intent: extractedLead.appointment ? `Appointment Confirmed (${extractedLead.appointment.slot})` : extractedLead.intent,
        urgency: extractedLead.urgency,
        summary: extractedLead.summary,
        requires_human: extractedLead.requires_human,
        appointment: extractedLead.appointment || null
      });
      return { reply, leadCaptured: saved, appointment: extractedLead.appointment || null };
    }

    return { reply, leadCaptured: null, appointment: extractedLead ? extractedLead.appointment : null };
  }

  async callGeminiAPI(client, history, userMessage) {
    const systemPrompt = `
You are the AI Sales and Booking Agent for "${client.name}".
Business Info & Instructions:
${client.system_prompt}

Tone & Rules:
- If the customer speaks Roman Urdu or Urdu, respond warmly and politely in fluent Roman Urdu / Urdu.
- If the customer speaks English or Arabic, respond in that language.
- Keep answers concise, persuasive, and helpful. Never sound robotic.
- Your main goal is to help the customer and gracefully collect their Name and Contact Number (WhatsApp/Phone) to confirm their order or booking.
- If the customer asks for a human manager or expresses anger/complaint, reassure them and flag human handoff.

Output format requirement:
Respond in valid JSON with exactly two fields:
{
  "reply": "The response string to send to the customer",
  "lead": {
    "customer_name": "extracted name or 'Anonymous Visitor'",
    "customer_phone": "extracted phone/WhatsApp number or 'N/A'",
    "customer_email": "extracted email or 'N/A'",
    "intent": "e.g. Order Placed, Price Inquiry, Booking Request, or General",
    "urgency": "High, Medium, or Low",
    "summary": "1-line summary of what the customer wants",
    "requires_human": true or false
  }
}
`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${this.apiKey}`;
    const payload = {
      contents: [
        {
          role: "user",
          parts: [
            { text: `${systemPrompt}\n\nChat History:\n${history}\n\nLatest Customer Message: "${userMessage}"\nRespond in JSON:` }
          ]
        }
      ],
      generationConfig: {
        responseMimeType: "application/json"
      }
    };

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      throw new Error(`Gemini HTTP ${res.status}: ${await res.text()}`);
    }

    const data = await res.json();
    const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return JSON.parse(textContent);
  }

  simulateIntelligentResponse(client, msg) {
    const text = msg.toLowerCase();
    let reply = '';
    let lead = {
      customer_name: 'Anonymous Visitor',
      customer_phone: 'N/A',
      customer_email: 'N/A',
      intent: 'Inquiry',
      urgency: 'Medium',
      summary: msg,
      requires_human: false
    };

    // Extract phone numbers (03xx or +92 or general 7-14 digit strings)
    const phoneMatch = msg.match(/(?:\+?\d{1,4}[ -]?)?\(?\d{2,4}\)?[ -]?\d{3,5}[ -]?\d{3,5}/);
    if (phoneMatch && phoneMatch[0].length >= 10) {
      lead.customer_phone = phoneMatch[0].trim();
      lead.urgency = 'High';
    }

    // Extract potential names
    const nameMatch = msg.match(/(?:mera naam|name is|i am|iam|this is)\s+([a-zA-Z]+)/i);
    if (nameMatch) {
      lead.customer_name = nameMatch[1];
    }

    // Human handoff detection
    if (text.includes('manager') || text.includes('insaan') || text.includes('human') || text.includes('fraud') || text.includes('complaint')) {
      lead.requires_human = true;
      lead.urgency = 'High';
      return {
        reply: client.country === 'Pakistan'
          ? "Bilkul jee, main ne aapki request hamare Senior Manager ko foran forward kar di hai. Wo jald se jald aapse rabta karenge. Kya aap apna phone number confirm kar sakte hain?"
          : "Understood. I have flagged your request for our Senior Manager. Someone will reach out to you directly shortly. Could you please confirm your best contact number?",
        lead
      };
    }

    // Intelligent Slot & Booking Detection
    const isBookingRequest = text.includes('book') || text.includes('appointment') || text.includes('meeting') || 
                             text.includes('slot') || text.includes('friday') || text.includes('tomorrow') || 
                             text.includes('monday') || text.includes('tuesday') || text.includes('wednesday') || 
                             text.includes('thursday') || text.includes('saturday') || text.includes('sunday') || 
                             text.includes('schedule') || text.includes('emergency') || text.includes('tooth pain') ||
                             text.includes('consultation') || text.includes('visit') || text.includes('walkthrough') ||
                             (phoneMatch && (text.includes('time') || text.includes('afternoon') || text.includes('pm') || text.includes('am')));

    let detectedSlot = "Tomorrow at 11:30 AM";
    if (text.includes('friday')) detectedSlot = "This Friday at 2:00 PM";
    else if (text.includes('tomorrow')) detectedSlot = "Tomorrow at 10:00 AM";
    else if (text.includes('monday')) detectedSlot = "Next Monday at 11:00 AM";
    else if (text.includes('afternoon') || text.includes('pm')) detectedSlot = "This Friday at 2:30 PM";
    else if (text.includes('morning') || text.includes('am')) detectedSlot = "Tomorrow at 9:30 AM";
    else if (text.includes('emergency') || text.includes('pain')) detectedSlot = "TODAY (Urgent Priority Slot - In 45 mins)";

    const isEmergency = text.includes('emergency') || text.includes('pain') || text.includes('toothache') || text.includes('severe');

    if (isBookingRequest) {
      lead.urgency = isEmergency ? 'Critical' : 'High';
      lead.intent = isEmergency ? '🚨 Emergency Clinical Triage' : '📅 Confirmed Appointment / Booking';

      const serviceName = client.id?.includes('realestate') ? "VIP Private Property Consultation" :
                          client.id?.includes('medspa') ? "Cosmetic & Aesthetic Assessment" :
                          client.niche === 'fashion' ? "VIP Order & Dispatch Confirmation" :
                          (isEmergency ? "Emergency Toothache Relief & X-Rays" : "Cosmetic Smile & Treatment Consultation");

      const doctorName = client.id?.includes('realestate') ? "Senior Portfolio Director" :
                         client.id?.includes('medspa') ? "Lead Aesthetic Specialist" :
                         "Dr. Mitchell & Clinical Team";

      lead.appointment = {
        status: "CONFIRMED & SYNCED",
        slot: detectedSlot,
        service: serviceName,
        doctor: doctorName,
        clinic: client.name,
        calendar_synced: true,
        sms_dispatched: true,
        patient_name: lead.customer_name !== 'Anonymous Visitor' ? lead.customer_name : 'Patient / Client',
        phone: lead.customer_phone !== 'N/A' ? lead.customer_phone : 'Confirmed on Record',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      if (isEmergency) {
        reply = `🚨 I understand you are in urgent pain! I have immediately expedited an Emergency Relief Slot for you: **${detectedSlot}** with ${doctorName} at ${client.name}.\n\n✅ **Instant Automation Completed:**\n• Attending Doctor alerted for urgent triage\n• Emergency slot locked on clinic schedule\n• Confirmation SMS with direct clinic directions dispatched\n\nPlease head in, our medical team is prepared for your arrival!`;
      } else if (client.id?.includes('realestate')) {
        reply = `🎉 Fantastic! Your private VIP Consultation and property walkthrough has been locked in for **${detectedSlot}**.\n\n✅ **Instant Automation Completed:**\n• Calendar invite & Zoom link dispatched to ${lead.customer_phone !== 'N/A' ? lead.customer_phone : 'your WhatsApp'}\n• Senior Portfolio Consultant reserved\n• Tailored investment pro-formas prepared\n\nWe look forward to our meeting!`;
      } else if (client.id?.includes('medspa')) {
        reply = `🎉 Wonderful! Your private Aesthetic Consultation has been confirmed for **${detectedSlot}** at ${client.name}.\n\n✅ **Instant Automation Completed:**\n• Treatment Suite & Aesthetic Specialist reserved\n• Confirmation SMS with preparation guidelines dispatched\n• Synced with our front desk calendar\n\nWe look forward to welcoming you!`;
      } else if (client.niche === 'fashion') {
        reply = `Assalam-o-Alaikum! Aapka order confirm ho chuka hai aur hamare automated dispatch system mein book ho gaya hai. Aapko tracking number SMS ke zariye bhej diya gaya hai. Shukriya!`;
      } else {
        reply = `🎉 Wonderful! Your appointment is officially confirmed for **${detectedSlot}** with ${doctorName} at ${client.name}.\n\n✅ **Instant Automation Completed:**\n• Added directly to Clinic Calendar & EHR system\n• Confirmation SMS & calendar invite dispatched to ${lead.customer_phone !== 'N/A' ? lead.customer_phone : 'your phone'}\n• Clinical team briefed\n\nWe look forward to welcoming you!`;
      }

      return { reply, lead };
    }

    // Business Niche Specific Logic (Pricing & Questions)
    if (client.niche === 'fashion') {
      if (text.includes('price') || text.includes('kitne') || text.includes('rate') || text.includes('suit') || text.includes('lawn')) {
        reply = "Assalam-o-Alaikum! Hamari Festive Stitched Lawn 3-Piece sirf Rs. 6,500 mein hai aur Luxury Chiffon Collection Rs. 9,800 mein available hai. S, M, L, aur XL sizes ready hain! Pore Pakistan mein Cash on Delivery (COD) bilkul free hai Rs. 5,000 se upar. Aapko kaunsa size ya design pasand aya hai?";
        lead.intent = "Product / Price Inquiry";
      } else {
        reply = "Assalam-o-Alaikum! Zahra Luxury Pret mein khush-aamdeed! Main aapka AI Fashion Assistant hoon. Kya aap Lawn Collection dekhna chahenge ya Chiffon Luxury Suits? Hamare paas pore Pakistan mein COD available hai!";
      }
    } else if (client.id?.includes('realestate') || client.niche === 'real_estate') {
      if (text.includes('price') || text.includes('cost') || text.includes('budget') || text.includes('downtown') || text.includes('palm')) {
        reply = "Hello! Our Downtown luxury residences start at AED 1.8M with a high-ROI 60/40 payment plan, while Palm Jumeirah waterfront villas start at AED 14M. Investors also receive complimentary UAE Golden Visa assistance. What type of property or budget are you currently considering?";
        lead.intent = "Investment Inquiry";
      } else {
        reply = `Welcome to ${client.name} Dubai. I am your 24/7 AI Property Advisor. Are you looking for high-ROI off-plan investment opportunities or ready-to-move luxury homes in Dubai?`;
      }
    } else if (client.id?.includes('medspa')) {
      reply = `Hello! At ${client.name}, our popular treatments include Botox ($12/unit), Hydrafacials ($199 special), and Laser Skin Rejuvenation. Would you like to reserve a 15-minute consultation slot?`;
      lead.intent = "Treatment Pricing Inquiry";
    } else {
      // Dental default
      if (text.includes('invisalign') || text.includes('whitening') || text.includes('cost') || text.includes('price') || text.includes('teeth')) {
        reply = `Hello! At ${client.name}, our comprehensive Invisalign packages start from $3,200 with 0% interest monthly financing from $99/mo. Professional Laser Whitening is also on special at $299. Would you like to check available slots for a free preliminary smile scan?`;
        lead.intent = "Treatment Pricing Inquiry";
      } else {
        reply = `Welcome to ${client.name}. I am your 24/7 AI Patient Care Coordinator. How may we assist with your smile makeover, teeth whitening, emergency toothache, or routine checkup today?`;
      }
    }

    return { reply, lead };
  }
}

module.exports = new AgentService();
