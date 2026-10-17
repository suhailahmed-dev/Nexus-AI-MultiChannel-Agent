const TEMPLATES = {
  fashion: {
    name: "Al-Mirha Luxury Lawn",
    country: "Pakistan",
    currency: "PKR",
    whatsapp_number: "+92 321 9876543",
    system_prompt: `Aap Al-Mirha Luxury Lawn ke AI Sales Assistant hain.
Zuban: Friendly aur polite Roman Urdu / Urdu.
Products:
- Unstitched 3-Piece Lawn: Rs. 4,500
- Stitched Ready-to-Wear Suit: Rs. 6,800
- Silk Digital Dupatta: Rs. 1,800
Payment & Delivery:
- Cash on Delivery (COD) pore Pakistan mein available hai. Delivery charges Rs. 200 (Rs. 5,000 se upar FREE delivery!).
- Delivery time: 3-5 days.
Goal: Customer ko size aur design guide karein aur unka Naam, Phone Number aur Address le kar order confirm karein.`
  },
  dental_us: {
    name: "Austin Premier Dental & Implants",
    country: "USA",
    currency: "USD",
    whatsapp_number: "+1 512 555 0199",
    system_prompt: `You are Sarah, the friendly AI Patient Coordinator at Austin Premier Dental in Texas.
Language: Warm, reassuring American English.
Services:
- Emergency Toothache Exam & X-Rays ($89 special).
- Dental Implants (From $1,899, financing from $79/mo).
- Invisalign Clear Aligners ($3,200 full treatment).
- Teeth Whitening ($299).
Insurance: In-network with all major PPOs (Delta, Cigna, MetLife).
Goal: Relieve dental fear, answer cost questions, and book an appointment slot on calendar.`
  },
  dental_au: {
    name: "Sydney Harbourside Dental Care",
    country: "Australia",
    currency: "AUD",
    whatsapp_number: "+61 2 9123 4567",
    system_prompt: `You are Chloe, the welcoming AI Receptionist at Sydney Harbourside Dental Care in Sydney, Australia.
Language: Polished, warm Australian English.
Services:
- Emergency Dental Pain Relief (Same day slots, $120 exam).
- Porcelain Veneers ($950/tooth).
- Check-up & Clean ($199 includes x-rays).
- Invisalign (Interest-free payment plans).
Health Funds: On-the-spot HICAPS claims for Bupa, Medibank, HCF.
Goal: Verify patient health fund and book appointment consultation.`
  },
  dental_dxb: {
    name: "Jumeirah Pearl Dental Clinic",
    country: "UAE",
    currency: "AED",
    whatsapp_number: "+971 4 345 6789",
    system_prompt: `You are Maya, VIP Patient Coordinator at Jumeirah Pearl Dental Clinic Dubai.
Language: Courteous English / Arabic / Urdu.
Services:
- Hollywood Smile Makeover & Veneers (From AED 8,500).
- Laser Teeth Whitening (AED 999).
- Dental Implants (German/Swiss from AED 3,500).
- Emergency Consultations (AED 350).
Goal: Offer complimentary initial consultation and secure Full Name, WhatsApp Number, and preferred slot.`
  },
  real_estate: {
    name: "Sobha Realty Signature Dubai",
    country: "UAE",
    currency: "AED",
    whatsapp_number: "+971 52 1234567",
    system_prompt: `You are an elite AI Property Advisor for Sobha Realty Signature Dubai.
Language: Professional English / Arabic / Roman Urdu.
Portfolio:
- Creek Vistas 1-Bed Waterfront Apartments (Starting AED 1.2M).
- Sobha Hartland Forest Villas (Starting AED 8.5M).
- Payment Plan: 80/20 with 2 years post-handover.
Goal: Qualify buyer intent (investment vs own stay, budget), explain high rental yield (8%+), and schedule a VIP Zoom or site visit. Collect Full Name, WhatsApp Number, and Email.`
  },
  healthcare: {
    name: "Harley Street Smiles London",
    country: "UK",
    currency: "GBP",
    whatsapp_number: "+44 20 8123 4567",
    system_prompt: `You are the patient coordinator at Harley Street Smiles Clinic London.
Language: Friendly, caring British English.
Offers:
- Full Arch Dental Implants (From £4,500 with finance from £120/mo).
- Invisalign Clear Braces (£2,800 all-inclusive).
- Teeth Whitening (£299 special package).
Goal: Address patient worries, offer free 3D smile scan consultation, and capture Patient Name, Phone, and preferred day.`
  }
};

let currentClientsCache = [];

async function loadDashboard() {
  try {
    const clientRes = await fetch('/api/clients');
    const clients = await clientRes.json();
    currentClientsCache = clients;
    renderClients(clients);

    const leadsRes = await fetch('/api/leads');
    const leads = await leadsRes.json();
    renderLeads(leads);

    document.getElementById('statTotalClients').textContent = clients.length;
    const activeTrials = clients.filter(c => !c.is_expired).length;
    document.getElementById('statActiveTrials').textContent = activeTrials;
    document.getElementById('statTotalLeads').textContent = leads.length;

    // Projected Monthly Recurring Revenue at affordable $199/client avg
    const projectedMrr = (clients.length * 199).toLocaleString();
    document.getElementById('statProjectedRevenue').textContent = `$${projectedMrr}`;

  } catch (err) {
    console.error('Failed to load dashboard:', err);
  }
}

function renderClients(clients) {
  const container = document.getElementById('clientsGrid');
  if (!container) return;

  container.innerHTML = clients.map(client => {
    let badgeHtml = '';
    if (client.is_expired) {
      badgeHtml = `<span class="badge badge-expired">Trial Expired</span>`;
    } else {
      badgeHtml = `<span class="badge badge-trial">${client.days_left || 7} Days Left</span>`;
    }

    return `
      <div class="client-card">
        <div>
          <div class="client-head">
            <div>
              <div class="client-name">${client.name}</div>
              <div class="client-meta">${client.country} • ${client.niche.toUpperCase()}</div>
            </div>
            ${badgeHtml}
          </div>
          <div class="client-body">
            <strong>Agent Knowledge Base:</strong><br/>
            ${client.system_prompt.substring(0, 130)}...
          </div>
        </div>
        <div class="client-footer">
          <a href="/call-lab.html?client=${client.id}" target="_blank" class="btn btn-primary" style="padding: 6px 9px; font-size: 11px; background: linear-gradient(135deg, #2563eb, #4f46e5);">
            📞 Voice Demo
          </a>
          <a href="/demo-lab.html?client=${client.id}" target="_blank" class="btn btn-primary" style="padding: 6px 9px; font-size: 11px; background: linear-gradient(135deg, #10b981, #059669);">
            📱 WhatsApp Demo
          </a>
          <button onclick="openOutreachModal('${client.id}')" class="btn btn-secondary" style="padding: 6px 9px; font-size: 11px; border-color:#eab308; color:#fde047;">
            ✉️ Outreach Pitch
          </button>
          <button onclick="copyEmbedCode('${client.id}')" class="btn btn-secondary" style="padding: 6px 9px; font-size: 11px;">
            📋 Widget
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function renderLeads(leads) {
  const tbody = document.getElementById('leadsTableBody');
  if (!tbody) return;

  if (leads.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:#9ca3af; padding: 24px;">No leads captured yet. Run a conversation in the Voice Call Lab or WhatsApp Simulator to test live lead extraction!</td></tr>`;
    return;
  }

  tbody.innerHTML = leads.map(lead => {
    const timeFormatted = new Date(lead.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const humanAlert = lead.requires_human ? `<span style="background:#f43f5e; color:#fff; padding:2px 8px; border-radius:10px; font-size:11px; font-weight:700;">URGENT HUMAN</span>` : '';

    return `
      <tr>
        <td><strong>${lead.customer_name}</strong></td>
        <td><a href="https://wa.me/${(lead.customer_phone || '').replace(/[^0-9]/g, '')}" target="_blank" style="color:#25D366; text-decoration:none; font-weight:600;">${lead.customer_phone || 'N/A'}</a></td>
        <td>${lead.client_id}</td>
        <td><span class="badge badge-active">${lead.intent}</span></td>
        <td><span class="${lead.urgency === 'High' ? 'lead-urgency-high' : ''}">${lead.urgency}</span> ${humanAlert}</td>
        <td>${timeFormatted}</td>
      </tr>
    `;
  }).join('');
}

function populateTemplate(niche) {
  const tpl = TEMPLATES[niche];
  if (!tpl) return;
  document.getElementById('newClientName').value = tpl.name;
  document.getElementById('newClientCountry').value = tpl.country;
  document.getElementById('newClientCurrency').value = tpl.currency;
  document.getElementById('newClientPhone').value = tpl.whatsapp_number;
  document.getElementById('newClientPrompt').value = tpl.system_prompt;
}

function openNewClientModal() {
  document.getElementById('newClientModal').style.display = 'flex';
  populateTemplate('dental_us');
}

function closeNewClientModal() {
  document.getElementById('newClientModal').style.display = 'none';
}

async function handleCreateClient(e) {
  e.preventDefault();
  const name = document.getElementById('newClientName').value;
  const niche = document.getElementById('newClientNiche').value;
  const country = document.getElementById('newClientCountry').value;
  const currency = document.getElementById('newClientCurrency').value;
  const phone = document.getElementById('newClientPhone').value;
  const prompt = document.getElementById('newClientPrompt').value;

  const id = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-') + '-' + Math.floor(Math.random() * 1000);

  try {
    const res = await fetch('/api/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: id,
        name: name,
        niche: niche,
        country: country,
        currency: currency,
        whatsapp_number: phone,
        system_prompt: prompt
      })
    });
    if (res.ok) {
      closeNewClientModal();
      loadDashboard();
      alert(`✅ New 7-Day Trial Agent created for "${name}"!`);
    }
  } catch (err) {
    alert("Error creating client: " + err.message);
  }
}

function getDealClosingWhatsApp() {
  const val = localStorage.getItem('nexus_deal_closing_whatsapp');
  if (val && val !== '+92 300 0000000') return val;
  return '+92 309 3174020';
}

function saveDealClosingWhatsApp(val) {
  const input = document.getElementById('myDealClosingWhatsApp');
  const number = (val || (input ? input.value : '')).trim();
  if (!number) {
    alert("Bhai apna valid WhatsApp number enter karein (e.g. +92 300 1234567)");
    return;
  }
  localStorage.setItem('nexus_deal_closing_whatsapp', number);
  if (input) input.value = number;
  updateHubPitchPreview();
  renderSprintLeads(currentSprintDay);
  alert(`✅ Aapka WhatsApp deal-closing number (${number}) save ho gaya hai! Ab tamam outgoing emails aur pitches mein yeh number auto-include hoga.`);
}

function openOutreachModal(clientId) {
  const client = currentClientsCache.find(c => c.id === clientId) || { name: "Your Clinic", country: "USA", id: clientId };
  const origin = window.location.origin;
  const callDemoUrl = `${origin}/call-lab.html?client=${client.id}&view=client`;
  const waDemoUrl = `${origin}/demo-lab.html?client=${client.id}&view=client`;
  const myWhatsApp = getDealClosingWhatsApp();
  const cleanMyWhatsApp = myWhatsApp.replace(/[^0-9]/g, '');
  const myWaDirectLink = cleanMyWhatsApp ? `https://wa.me/${cleanMyWhatsApp}` : '';

  const waScript = `Hi Dr. ${client.name},

Found ${client.name} while researching top practices in ${client.country}.

Quick question: When a patient calls with a toothache or appointment inquiry during lunch hours or late evening, does it go to voicemail?

We set up a 24/7 AI Receptionist trained on dental emergencies and treatments that answers in 2 rings and schedules patients directly on your calendar.

Here is a 30-second live voice demo we customized for ${client.name}:
👉 ${callDemoUrl}

We are offering a 7-Day Free Pilot to 3 clinics this week (zero setup fee, no card required). Would you be open to testing it out?

Reply right here or WhatsApp me directly:
📲 ${myWhatsApp}

Best regards,
Suhail Ahmed
Nexus AI Automation`;

  const emailSubject = `Missed patient calls at ${client.name}? (30-sec demo inside)`;
  const emailBody = `Hi ${client.name} Team,

Most clinics in ${client.country} lose $3,000 to $8,000 every month simply from patients hanging up when calls go to voicemail during busy hours.

We build Voice AI Receptionists that answer calls within 2 rings, answer treatment FAQs (Invisalign, cleanings, tooth pain), and book appointments into your schedule.

Here is a quick live demo customized for ${client.name}:
👉 Live Voice Call Demo: ${callDemoUrl}
👉 Live WhatsApp Demo: ${waDemoUrl}

We are currently onboarding clinics for an introductory 7-Day Free Pilot ($0 setup fee) so you can test it risk-free.

Would you be open to a quick 5-minute chat this week?

Best regards,
Suhail Ahmed
Nexus AI Solutions
📲 Direct WhatsApp: ${myWhatsApp}
👉 Chat on WhatsApp: ${myWaDirectLink}`;

  document.getElementById('outreachClientTitle').textContent = `Outreach Pitch for: ${client.name} (${client.country})`;
  document.getElementById('outreachWaText').value = waScript;
  document.getElementById('outreachEmailSubject').value = emailSubject;
  document.getElementById('outreachEmailBody').value = emailBody;

  document.getElementById('outreachModal').style.display = 'flex';
}

function closeOutreachModal() {
  document.getElementById('outreachModal').style.display = 'none';
}

function copyPitch(type) {
  let text = '';
  if (type === 'wa') {
    text = document.getElementById('outreachWaText').value;
  } else {
    const subj = document.getElementById('outreachEmailSubject').value;
    const body = document.getElementById('outreachEmailBody').value;
    text = `Subject: ${subj}\n\n${body}`;
  }
  navigator.clipboard.writeText(text);
  alert(`📋 ${type === 'wa' ? 'WhatsApp' : 'Email'} pitch copied to clipboard! You can paste and send directly.`);
}

function copyEmbedCode(clientId) {
  const origin = window.location.origin;
  const code = `<script src="${origin}/widget.js" data-client-id="${clientId}"><\/script>`;
  navigator.clipboard.writeText(code);
  alert(`📋 1-Line Embed Code copied to clipboard!\n\n${code}\n\nPaste this in the <head> or <body> of the client's website to enable the floating AI Agent!`);
}

// --- 1-CLICK OUTREACH HUB AUTOMATION ---

function getHubData() {
  const selectElem = document.getElementById('hubClientSelect');
  const clientId = selectElem ? selectElem.value : 'dental-us';
  const customName = document.getElementById('hubCustomName')?.value.trim();
  const targetEmail = document.getElementById('hubTargetEmail')?.value.trim() || '';
  const targetPhone = document.getElementById('hubTargetPhone')?.value.trim() || '';

  const client = currentClientsCache.find(c => c.id === clientId) || {
    name: "Premier Clinic",
    country: "USA",
    id: clientId
  };

  const businessName = customName || client.name;
  const origin = window.location.origin;
  const voiceUrl = `${origin}/call-lab.html?client=${client.id}&view=client`;
  const waUrl = `${origin}/demo-lab.html?client=${client.id}&view=client`;
  const myWhatsApp = getDealClosingWhatsApp();
  const cleanMyWhatsApp = myWhatsApp.replace(/[^0-9]/g, '');
  const myWaDirectLink = cleanMyWhatsApp ? `https://wa.me/${cleanMyWhatsApp}` : '';

  const subject = `Missed patient calls at ${businessName}? (30-sec demo inside)`;

  const emailBody = `Hi ${businessName} Team,

Most clinics in ${client.country} lose $3,000 to $8,000 every month simply from patients hanging up when calls go to voicemail during lunch hours, busy front-desk times, or weekends.

We build custom 24/7 Voice AI Receptionists that answer patient calls in 2 rings, answer treatment FAQs (tooth pain, insurance, cleanings), and schedule appointments directly on your calendar.

I set up a quick 30-second live test line customized for ${businessName}:
👉 Live Voice Demo: ${voiceUrl}
👉 WhatsApp Demo: ${waUrl}

(Click the demo link above on your phone or computer to test how naturally the AI answers and books).

We are currently onboarding 3 clinics for an introductory 7-Day Free Pilot ($0 setup fee, no card required) so you can test it risk-free.

Would you be open to a quick 5-minute chat this week?

Best regards,
Suhail Ahmed
Nexus AI Solutions
📲 Direct WhatsApp: ${myWhatsApp}
👉 Chat on WhatsApp: ${myWaDirectLink}`;

  const waMessage = `Hi Dr. ${businessName},

Found ${businessName} while researching top practices in ${client.country}.

Quick question: When a patient calls with an appointment inquiry or toothache during lunch hours or late evening, does it go to voicemail?

We set up a 24/7 Voice AI Receptionist trained on dental treatments & emergencies that answers in 2 rings and schedules patients directly on your calendar.

Here is a 30-second live voice demo customized for ${businessName}:
👉 ${voiceUrl}

We are offering an introductory 7-Day Free Pilot to 3 clinics this week (zero setup fee, no card required). Would you be open to testing it out?

Reply right here or WhatsApp me directly:
📲 ${myWhatsApp}

Best regards,
Suhail Ahmed
Nexus AI Solutions`;

  return { client, businessName, targetEmail, targetPhone, voiceUrl, waUrl, subject, emailBody, waMessage };
}

function updateHubPitchPreview() {
  const data = getHubData();
  const subjElem = document.getElementById('previewEmailSubject');
  const bodyElem = document.getElementById('previewEmailBody');
  const waElem = document.getElementById('previewWaText');
  const phoneElem = document.getElementById('previewWaPhone');

  if (subjElem) subjElem.textContent = data.subject;
  if (bodyElem) bodyElem.value = data.emailBody;
  if (waElem) waElem.value = data.waMessage;
  if (phoneElem) phoneElem.textContent = data.targetPhone || "Any WhatsApp Number";
}

function launchDirectGmail() {
  const data = getHubData();
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  if (isMobile) {
    const mailtoUrl = `mailto:${encodeURIComponent(data.targetEmail)}?subject=${encodeURIComponent(data.subject)}&body=${encodeURIComponent(data.emailBody)}`;
    window.location.href = mailtoUrl;
  } else {
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(data.targetEmail)}&su=${encodeURIComponent(data.subject)}&body=${encodeURIComponent(data.emailBody)}`;
    window.open(gmailUrl, '_blank');
  }
}

function launchDirectWhatsApp() {
  const data = getHubData();
  const cleanPhone = (data.targetPhone || '').replace(/[^0-9]/g, '');
  let waUrl = '';
  if (cleanPhone) {
    waUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(data.waMessage)}`;
  } else {
    waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(data.waMessage)}`;
  }
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  if (isMobile) {
    window.location.href = waUrl;
  } else {
    window.open(waUrl, '_blank');
  }
}

function launchDirectMailto() {
  const data = getHubData();
  const mailtoUrl = `mailto:${encodeURIComponent(data.targetEmail)}?subject=${encodeURIComponent(data.subject)}&body=${encodeURIComponent(data.emailBody)}`;
  window.location.href = mailtoUrl;
}

function openCurrentVoiceDemo() {
  const data = getHubData();
  window.open(data.voiceUrl, '_blank');
}

function copyCurrentPitch() {
  const data = getHubData();
  const text = `--- EMAIL PITCH ---\nSubject: ${data.subject}\n\n${data.emailBody}\n\n====================\n\n--- WHATSAPP PITCH ---\n${data.waMessage}`;
  navigator.clipboard.writeText(text);
  alert(`📋 Both Email & WhatsApp pitches copied to clipboard with live demo links!`);
}

// --- 7-DAY SPRINT MISSION LEADS (AUTO-DISABLE & PROGRESS TRACKING) ---

const SPRINT_LEADS = {
  1: [
    {
      id: "d1-us-dallas-mitchell",
      name: "North Dallas Cosmetic Dentistry",
      city: "Dallas, Texas, USA",
      email: "drrobertmitchell@robertmitchelldds.com",
      phone: "+19722331311",
      clientId: "dental-us",
      niche: "Emergency & Cosmetic Dental",
      badge: "🇺🇸 USA"
    },
    {
      id: "d1-us-dallas-bravo",
      name: "Bravo! Dental Dallas",
      city: "Dallas, Texas, USA",
      email: "BF@bravodentaldallas.com",
      phone: "+12143075671",
      clientId: "dental-us",
      niche: "Family & Emergency Dental",
      badge: "🇺🇸 USA"
    },
    {
      id: "d1-dxb-dentistree",
      name: "DentisTree Clinic Jumeirah",
      city: "Jumeirah 1, Dubai, UAE",
      email: "jumeirah@dentistree.ae",
      phone: "+971566084766",
      clientId: "dental-dxb",
      niche: "Veneers & Hollywood Smile",
      badge: "🇦🇪 Dubai"
    },
    {
      id: "d1-dxb-bluedental",
      name: "Blue Dental Clinic Jumeirah",
      city: "Jumeirah 3, Dubai, UAE",
      email: "reception@bluedentalclinic.com",
      phone: "+971507691575",
      clientId: "dental-dxb",
      niche: "Cosmetic & Emergency Dental",
      badge: "🇦🇪 Dubai"
    },
    {
      id: "d1-au-sydney-abc",
      name: "ABC Dental Sydney",
      city: "Sydney NSW, Australia",
      email: "info@abc-dental.com.au",
      phone: "+61283831400",
      clientId: "dental-au",
      niche: "7-Day Emergency & Checkup",
      badge: "🇦🇺 Australia"
    }
  ],
  2: [
    {
      id: "d2-dxb-elysian",
      name: "Elysian Luxe Real Estate",
      city: "Downtown Dubai, UAE",
      email: "invest@elysianproperties.ae",
      phone: "+971509876543",
      clientId: "realestate-dxb",
      niche: "Luxury Waterfront Villas",
      badge: "🇦🇪 Dubai"
    },
    {
      id: "d2-dxb-sobha",
      name: "Sobha Signature Properties",
      city: "Business Bay, Dubai",
      email: "sales@sobhadubai.ae",
      phone: "+971521234567",
      clientId: "realestate-dxb",
      niche: "High-ROI Off-Plan Apartments",
      badge: "🇦🇪 Dubai"
    },
    {
      id: "d2-dxb-driven",
      name: "Driven Properties Dubai",
      city: "Dubai Marina, UAE",
      email: "contact@drivenproperties.com",
      phone: "+97144297040",
      clientId: "realestate-dxb",
      niche: "Palm Jumeirah & Marina Luxe",
      badge: "🇦🇪 Dubai"
    },
    {
      id: "d2-dxb-betterhomes",
      name: "Betterhomes UAE",
      city: "Al Barsha, Dubai",
      email: "customercare@bhomes.com",
      phone: "+971600522233",
      clientId: "realestate-dxb",
      niche: "Residential & Investment Sales",
      badge: "🇦🇪 Dubai"
    },
    {
      id: "d2-dxb-dandb",
      name: "D&B Properties Dubai",
      city: "Business Bay, Dubai",
      email: "inquiry@dandbdubai.com",
      phone: "+97148719200",
      clientId: "realestate-dxb",
      niche: "Off-Plan & Golden Visa Advisory",
      badge: "🇦🇪 Dubai"
    }
  ],
  3: [
    {
      id: "d3-au-cosmetic",
      name: "Cosmetic Dental Sydney",
      city: "Sydney NSW, Australia",
      email: "smile@cosmeticdentalsydney.sydney",
      phone: "+61295883979",
      clientId: "dental-au",
      niche: "Porcelain Veneers & Orthodontics",
      badge: "🇦🇺 Australia"
    },
    {
      id: "d3-au-cbd",
      name: "Sydney CBD Dentistry",
      city: "70 Pitt St, Sydney CBD",
      email: "info@sydneycbddentistry.com.au",
      phone: "+61280901101",
      clientId: "dental-au",
      niche: "Teeth Whitening & Implants",
      badge: "🇦🇺 Australia"
    },
    {
      id: "d3-au-apple",
      name: "Apple Dental Lane Cove",
      city: "Lane Cove, Sydney NSW",
      email: "Reception.AppleDental@nationaldentalcare.com.au",
      phone: "+61294205050",
      clientId: "dental-au",
      niche: "Preventative & Smile Aesthetics",
      badge: "🇦🇺 Australia"
    },
    {
      id: "d3-au-sparkling",
      name: "Sparkling Dental Emergency",
      city: "Neutral Bay, Sydney",
      email: "info@sparklingdental.com.au",
      phone: "+61426651885",
      clientId: "dental-au",
      niche: "24/7 Urgent Pain Care",
      badge: "🇦🇺 Australia"
    },
    {
      id: "d3-au-melbourne",
      name: "Melbourne City Dental",
      city: "Melbourne CBD, Victoria",
      email: "info@melbournecitydental.com.au",
      phone: "+61396545464",
      clientId: "dental-au",
      niche: "Invisalign & Health Fund Claims",
      badge: "🇦🇺 Australia"
    }
  ],
  4: [
    {
      id: "d4-us-beverly",
      name: "Beverly Hills Aesthetic MedSpa",
      city: "Beverly Hills, CA, USA",
      email: "contact@bhmedspa.com",
      phone: "+13105550144",
      clientId: "medspa-us",
      niche: "Botox & Dermal Fillers",
      badge: "🇺🇸 USA"
    },
    {
      id: "d4-us-skinlaundry",
      name: "Skin Laundry Los Angeles",
      city: "West Hollywood, CA",
      email: "hello@skinlaundry.com",
      phone: "+13105550177",
      clientId: "medspa-us",
      niche: "Laser Facials & Rejuvenation",
      badge: "🇺🇸 USA"
    },
    {
      id: "d4-us-miami",
      name: "Miami Beach Aesthetic Lounge",
      city: "Miami Beach, Florida",
      email: "concierge@miamiaesthetics.com",
      phone: "+13055550199",
      clientId: "medspa-us",
      niche: "Body Contouring & Skin Glow",
      badge: "🇺🇸 USA"
    },
    {
      id: "d4-us-dallasmed",
      name: "Dallas Laser & Skin Institute",
      city: "Dallas, Texas, USA",
      email: "info@dallaslaserskin.com",
      phone: "+12145550166",
      clientId: "medspa-us",
      niche: "Hydrafacials & Microneedling",
      badge: "🇺🇸 USA"
    },
    {
      id: "d4-us-scottsdale",
      name: "Scottsdale Glow MedSpa",
      city: "Scottsdale, Arizona",
      email: "appointments@scottsdaleglow.com",
      phone: "+14805550133",
      clientId: "medspa-us",
      niche: "Anti-Aging & Injectables",
      badge: "🇺🇸 USA"
    }
  ],
  5: [
    {
      id: "d5-dxb-lucia",
      name: "Lucia Clinic Dubai",
      city: "Jumeirah 2, Dubai",
      email: "info@luciaclinic.com",
      phone: "+97143854525",
      clientId: "dental-dxb",
      niche: "Celebrity Aesthetics & Smile",
      badge: "🇦🇪 Dubai"
    },
    {
      id: "d5-dxb-cocoona",
      name: "Cocoona Aesthetic Centre",
      city: "Al Wasl Rd, Dubai",
      email: "info@cocoona.ae",
      phone: "+971800362637",
      clientId: "dental-dxb",
      niche: "Cosmetic Surgery & Smile Design",
      badge: "🇦🇪 Dubai"
    },
    {
      id: "d5-dxb-kaya",
      name: "Kaya Skin & Smile Clinic",
      city: "Town Centre Jumeirah, Dubai",
      email: "care@kayaskinclinic.com",
      phone: "+97160056292",
      clientId: "dental-dxb",
      niche: "Aesthetic Laser & Dental",
      badge: "🇦🇪 Dubai"
    },
    {
      id: "d5-dxb-biolite",
      name: "Biolite Aesthetic Clinic",
      city: "Umm Suqeim 2, Dubai",
      email: "info@biolitedubai.com",
      phone: "+97143466641",
      clientId: "dental-dxb",
      niche: "VIP Anti-Aging & Dental",
      badge: "🇦🇪 Dubai"
    },
    {
      id: "d5-dxb-novomed",
      name: "Novomed Specialized Clinics",
      city: "Dubai Marina & Jumeirah",
      email: "info@novomed.com",
      phone: "+9718006686",
      clientId: "dental-dxb",
      niche: "Integrative Dental & Health",
      badge: "🇦🇪 Dubai"
    }
  ],
  6: [
    {
      id: "d6-au-solarnation",
      name: "Solar Power Nation Australia",
      city: "Sydney & Brisbane, Australia",
      email: "sales@solarpowernation.com.au",
      phone: "+611300854499",
      clientId: "dental-au",
      niche: "Commercial & Home Solar Systems",
      badge: "🇦🇺 Australia"
    },
    {
      id: "d6-au-ausolar",
      name: "Australian Solar Care",
      city: "Melbourne, Victoria",
      email: "info@australiansolarcare.com.au",
      phone: "+611300989333",
      clientId: "dental-au",
      niche: "High-Ticket Inverters & Battery",
      badge: "🇦🇺 Australia"
    },
    {
      id: "d6-au-plumbing",
      name: "Sydney Emergency Plumbing",
      city: "Western Sydney, NSW",
      email: "service@sydneyemergencyplumbing.com.au",
      phone: "+61291238899",
      clientId: "dental-au",
      niche: "24/7 Blocked Drains & Hot Water",
      badge: "🇦🇺 Australia"
    },
    {
      id: "d6-au-goldcoast",
      name: "Gold Coast Solar Power Solutions",
      city: "Gold Coast, Queensland",
      email: "info@goldcoastsolarpower.com.au",
      phone: "+61755200110",
      clientId: "dental-au",
      niche: "Solar Installations & Repairs",
      badge: "🇦🇺 Australia"
    },
    {
      id: "d6-au-electricians",
      name: "Platinum Electricians Sydney",
      city: "Sydney CBD & Parramatta",
      email: "enquiry@platinumelectricians.com.au",
      phone: "+611800752846",
      clientId: "dental-au",
      niche: "Master Electricians & Rewiring",
      badge: "🇦🇺 Australia"
    }
  ],
  7: [
    {
      id: "d7-followup-1",
      name: "Follow-up Batch: Day 1 US Dentists",
      city: "Dallas, Texas, USA",
      email: "drrobertmitchell@robertmitchelldds.com",
      phone: "+19722331311",
      clientId: "dental-us",
      niche: "Re-check Voice Demo Response",
      badge: "🔄 Follow-Up"
    },
    {
      id: "d7-followup-2",
      name: "Follow-up Batch: Day 1 Dubai Clinics",
      city: "Jumeirah, Dubai, UAE",
      email: "jumeirah@dentistree.ae",
      phone: "+971566084766",
      clientId: "dental-dxb",
      niche: "Re-check WhatsApp Demo Response",
      badge: "🔄 Follow-Up"
    },
    {
      id: "d7-followup-3",
      name: "Follow-up Batch: Day 2 Dubai Real Estate",
      city: "Downtown Dubai",
      email: "invest@elysianproperties.ae",
      phone: "+971509876543",
      clientId: "realestate-dxb",
      niche: "Re-check Booking Consultation",
      badge: "🔄 Follow-Up"
    },
    {
      id: "d7-followup-4",
      name: "Follow-up Batch: Day 3 Sydney Dentists",
      city: "Sydney NSW, Australia",
      email: "info@abc-dental.com.au",
      phone: "+61283831400",
      clientId: "dental-au",
      niche: "Re-check 7-Day Pilot Onboarding",
      badge: "🔄 Follow-Up"
    },
    {
      id: "d7-followup-5",
      name: "Follow-up Batch: Day 4 USA MedSpas",
      city: "Beverly Hills, CA",
      email: "contact@bhmedspa.com",
      phone: "+13105550144",
      clientId: "medspa-us",
      niche: "Activate $149/mo Retainer Agreement",
      badge: "🔄 Follow-Up"
    }
  ]
};

let currentSprintDay = 1;

function switchSprintDay(dayNum) {
  currentSprintDay = dayNum;

  // Update tabs style
  for (let i = 1; i <= 7; i++) {
    const tab = document.getElementById(`tabDay${i}`);
    if (tab) {
      if (i === dayNum) {
        tab.className = "btn";
        tab.style.background = "#2563eb";
        tab.style.color = "#fff";
        tab.style.fontWeight = "700";
      } else {
        tab.className = "btn btn-secondary";
        tab.style.background = "transparent";
        tab.style.color = "var(--text-muted)";
        tab.style.fontWeight = "400";
      }
    }
  }

  renderSprintLeads(dayNum);
}

function getLeadSprintStatus(leadId) {
  const stored = localStorage.getItem(`nexus_sprint_${leadId}`);
  let status = { gmailSent: false, gmailTime: null, waSent: false, waTime: null };
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (parsed.sent && !parsed.gmailSent && !parsed.waSent) {
        if (parsed.channel === 'gmail') {
          status.gmailSent = true;
          status.gmailTime = parsed.time;
        } else if (parsed.channel === 'wa') {
          status.waSent = true;
          status.waTime = parsed.time;
        }
      } else {
        status = { ...status, ...parsed };
      }
    } catch(e){}
  }
  return status;
}

function renderSprintLeads(dayNum) {
  const container = document.getElementById('sprintLeadsContainer');
  if (!container) return;

  const leads = SPRINT_LEADS[dayNum] || [];
  let completedCount = 0;
  let partialCount = 0;

  const html = leads.map(lead => {
    const status = getLeadSprintStatus(lead.id);

    // Complete when WhatsApp is sent OR if lead has no phone and Gmail is sent
    const isComplete = status.waSent || (!lead.phone && status.gmailSent);
    const isGmailSent = status.gmailSent;
    const isWaSent = status.waSent;

    if (isComplete) {
      completedCount++;
    } else if (isGmailSent) {
      partialCount++;
    }

    const cardOpacity = isComplete ? "0.6" : "1";
    const titleStrike = isComplete ? "text-decoration: line-through; color: #94a3b8;" : "color: #fff;";
    const borderStyle = isComplete ? "1px solid #10b981" : (isGmailSent ? "1px solid #3b82f6" : "1px solid rgba(59,130,246,0.3)");

    let badgeColor = "#2563eb";
    if (lead.badge.includes('Dubai')) badgeColor = "#059669";
    if (lead.badge.includes('Australia')) badgeColor = "#d97706";
    if (lead.badge.includes('Follow-Up')) badgeColor = "#9333ea";

    // Status note under contact info
    let statusNote = '';
    if (isComplete) {
      const sentVia = isGmailSent && isWaSent ? 'Gmail & WhatsApp' : (isWaSent ? 'WhatsApp' : 'Gmail');
      statusNote = `<div style="font-size:11px; color:#34d399; font-weight:700; margin-top:6px;">✅ Deal Pitch Complete via ${sentVia} (${status.waTime || status.gmailTime})</div>`;
    } else if (isGmailSent) {
      statusNote = `<div style="font-size:11px; color:#38bdf8; font-weight:700; margin-top:6px;">✉️ Email Sent (${status.gmailTime}) • <span style="color:#25D366; font-weight:800;">💬 Click WA to follow up on WhatsApp →</span></div>`;
    }

    // Gmail button: disabled if Gmail was sent OR if lead is already complete
    const isGmailBtnDisabled = isGmailSent || isComplete;
    // WhatsApp button: disabled ONLY if WhatsApp was sent
    const isWaBtnDisabled = isWaSent;

    return `
      <div class="sprint-lead-card" style="background:#131b2e; border:${borderStyle}; border-radius:12px; padding:14px; display:flex; justify-content:space-between; align-items:center; opacity:${cardOpacity}; transition: all 0.3s ease; gap:10px;">
        <div style="flex:1; min-width:0;">
          <div style="display:flex; align-items:center; gap:6px; margin-bottom:4px; flex-wrap:wrap;">
            <span style="font-size:10px; font-weight:800; background:${badgeColor}; color:#fff; padding:2px 6px; border-radius:4px;">${lead.badge}</span>
            <span style="font-weight:700; font-size:13px; ${titleStrike}">${lead.name}</span>
          </div>
          <div style="font-size:12px; color:#93c5fd; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:100%;">
            ${lead.email || lead.phone}
          </div>
          <div style="font-size:11px; color:var(--text-muted); margin-top:2px;">
            ${lead.city} • ${lead.niche}
          </div>
          ${statusNote}
        </div>

        <div style="display:flex; flex-direction:column; gap:6px; align-items:flex-end; flex-shrink:0;">
          <div style="display:flex; gap:6px;">
            ${lead.email ? `
              <button onclick="triggerSprintAction('${lead.id}', '${lead.name}', '${lead.clientId}', '${lead.email}', '${lead.phone}', 'gmail')" 
                class="btn" 
                style="background:${isGmailBtnDisabled ? '#475569' : '#ea4335'}; color:${isGmailBtnDisabled ? '#94a3b8' : '#fff'}; padding:8px 12px; font-size:12px; font-weight:700; border-radius:8px; min-height:36px; min-width:74px; justify-content:center; ${isGmailBtnDisabled ? 'cursor:not-allowed; opacity:0.6;' : ''}"
                ${isGmailBtnDisabled ? 'disabled' : ''}>
                ${isGmailSent ? '✓ Email' : '✉️ Gmail'}
              </button>
            ` : ''}

            ${lead.phone ? `
              <button onclick="triggerSprintAction('${lead.id}', '${lead.name}', '${lead.clientId}', '${lead.email}', '${lead.phone}', 'wa')" 
                class="btn" 
                style="background:${isWaBtnDisabled ? '#475569' : '#25D366'}; color:${isWaBtnDisabled ? '#94a3b8' : '#fff'}; padding:8px 12px; font-size:12px; font-weight:700; border-radius:8px; min-height:36px; min-width:74px; justify-content:center; ${isWaBtnDisabled ? 'cursor:not-allowed; opacity:0.6;' : 'box-shadow:0 0 10px rgba(37,211,102,0.3);'}"
                ${isWaBtnDisabled ? 'disabled' : ''}>
                ${isWaSent ? '✓ WA' : '💬 WA'}
              </button>
            ` : ''}
          </div>

          ${(isGmailSent || isWaSent) ? `
            <button onclick="resetSprintLead('${lead.id}')" style="background:none; border:none; color:#94a3b8; font-size:11px; text-decoration:underline; cursor:pointer; padding:2px;">↺ Undo / Reset</button>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = html;

  // Update Progress Bar
  const total = leads.length;
  const percent = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  const extraNote = partialCount > 0 ? ` (${partialCount} via Email)` : '';
  document.getElementById('sprintProgressText').textContent = `${completedCount} / ${total} Fully Completed${extraNote}`;
  document.getElementById('sprintPercentText').textContent = `${percent}%`;
  document.getElementById('sprintProgressBar').style.width = `${percent}%`;

  // Update all Sprint Tab counters and badges
  for (let d = 1; d <= 7; d++) {
    const dayLeads = SPRINT_LEADS[d] || [];
    let dDone = 0;
    dayLeads.forEach(l => {
      const s = getLeadSprintStatus(l.id);
      if (s.waSent || (!l.phone && s.gmailSent)) dDone++;
    });
    const tab = document.getElementById(`tabDay${d}`);
    if (tab) {
      if (!tab.getAttribute('data-base-title')) {
        tab.setAttribute('data-base-title', tab.textContent.trim());
      }
      const baseTitle = tab.getAttribute('data-base-title');
      const isComplete = dDone === dayLeads.length && dayLeads.length > 0;
      tab.innerHTML = `${baseTitle} <span style="font-size:10px; font-weight:700; opacity:0.9; margin-left:4px; padding:1px 5px; border-radius:4px; background:${isComplete ? '#10b981' : 'rgba(255,255,255,0.15)'}; color:#fff;">${dDone}/${dayLeads.length}${isComplete ? ' ✓' : ''}</span>`;
    }
  }

  // Show/Hide celebration banner
  const banner = document.getElementById('sprintCompleteBanner');
  if (banner) {
    if (completedCount === total && total > 0) {
      banner.style.display = 'block';
      banner.innerHTML = `
        <div style="font-size:16px; font-weight:800; color:#34d399;">🎉 MUBARAK HO! Day ${dayNum} Ka Mission Complete! (${completedCount}/${total} Sent)</div>
        <div style="font-size:12px; color:#e2e8f0; margin-top:6px;">
          Aapne aaj ke saare ${total} international clients ko personalized demo bhej diya hai. Yeh contacts dashboard par auto-disable ho chuke hain taake dubara repeat na hon.
        </div>
        ${dayNum < 7 ? `
          <div style="margin-top:12px;">
            <button onclick="switchSprintDay(${dayNum + 1})" class="btn" style="background:#10b981; color:#fff; font-weight:800; font-size:12px; padding:8px 18px; border-radius:8px; cursor:pointer; box-shadow:0 0 15px rgba(16,185,129,0.4);">
              👉 Unlock Day ${dayNum + 1}: Agla Din Shuru Karein
            </button>
          </div>
        ` : `
          <div style="margin-top:10px; font-size:13px; font-weight:700; color:#fbbf24;">
            🏆 7-Day Sprint Shandaar Tareeqay Se Mukammal! Ab In Ke Replies Check Karein Aur Pilot Onboarding Shuru Karein!
          </div>
        `}
      `;
    } else {
      banner.style.display = 'none';
    }
  }
}

function quickLeadAction(businessName, clientId, email, phone, channel) {
  const origin = window.location.origin;
  const voiceUrl = `${origin}/call-lab.html?client=${clientId}&view=client`;
  const waUrl = `${origin}/demo-lab.html?client=${clientId}&view=client`;

  const myWhatsApp = getDealClosingWhatsApp();
  const cleanMyWhatsApp = myWhatsApp.replace(/[^0-9]/g, '');
  const myWaDirectLink = cleanMyWhatsApp ? `https://wa.me/${cleanMyWhatsApp}` : '';

  const client = currentClientsCache.find(c => c.id === clientId) || {
    name: businessName,
    country: "USA",
    id: clientId
  };

  let subject = `Missed patient calls at ${businessName}? (30-sec demo inside)`;
  let emailBody = `Hi ${businessName} Team,\n\nMost practices in ${client.country} lose $3,000 to $8,000 every month simply from patients hanging up when calls go to voicemail during lunch hours, busy front-desk times, or weekends.\n\nWe build custom 24/7 Voice & WhatsApp AI Receptionists that answer patient calls in 2 rings, answer treatment FAQs (tooth pain, insurance, cleanings), and schedule appointments directly on your calendar.\n\nI set up two quick 30-second live demos customized for ${businessName}:\n👉 🎙️ Live Voice Call Demo: ${voiceUrl}\n👉 💬 24/7 WhatsApp Booking Demo: ${waUrl}\n\n(Click either link above on your phone or computer to test how naturally the AI answers questions and books appointments into your calendar).\n\nWe are currently onboarding 3 clinics for an introductory 7-Day Free Pilot ($0 setup fee, no card required) so you can test it risk-free on your secondary line.\n\nWould you be open to a quick 5-minute chat this week?\n\nBest regards,\nSuhail Ahmed\nNexus AI Solutions\n📲 Direct WhatsApp: ${myWhatsApp}\n👉 Chat on WhatsApp: ${myWaDirectLink}`;

  let waMessage = `Hi Dr. ${businessName},\n\nFound ${businessName} while researching top practices in ${client.country}.\n\nQuick question: When a patient calls with an appointment inquiry or toothache during lunch hours or late evening, does it go to voicemail?\n\nWe set up 24/7 Voice & WhatsApp AI Receptionists trained on dental treatments & emergencies that answer in 2 rings and schedule patients directly on your calendar.\n\nHere are your customized 30-second live demos:\n👉 🎙️ Voice Call Demo: ${voiceUrl}\n👉 💬 WhatsApp Agent: ${waUrl}\n\nWe are offering an introductory 7-Day Free Pilot to 3 clinics this week (zero setup fee, no card required). Would you be open to testing it out?\n\nReply right here or message me on WhatsApp at ${myWhatsApp} to claim a spot!\n\nBest regards,\nSuhail Ahmed\nNexus AI Solutions`;

  if (clientId.includes('realestate')) {
    subject = `Missed buyer inquiries at ${businessName}? (30-sec demo inside)`;
    emailBody = `Hi ${businessName} Team,\n\nHigh-net-worth property buyers and investors browsing Dubai properties expect instant replies. Inquiries that wait more than 5 minutes lose 80% interest.\n\nWe build custom 24/7 AI Property Advisors that qualify buyer budgets, answer off-plan project questions, and schedule VIP site/Zoom visits automatically.\n\nI created two quick 30-second live demos for ${businessName}:\n👉 🎙️ Voice Call Demo: ${voiceUrl}\n👉 💬 WhatsApp Agent: ${waUrl}\n\nWe are offering a 7-Day Free Pilot ($0 setup fee) so you can test it on your leads risk-free.\n\nWould you be open to a quick 5-minute chat?\n\nBest regards,\nSuhail Ahmed\nNexus AI Solutions\n📲 Direct WhatsApp: ${myWhatsApp}\n👉 Chat on WhatsApp: ${myWaDirectLink}`;
    waMessage = `Hi ${businessName} Team,\n\nWe set up 24/7 Voice & WhatsApp AI Property Advisors for Dubai luxury real estate that qualify buyers and book VIP viewings in under 10 seconds.\n\nTest the 30-second live demos here:\n👉 🎙️ Voice Call Demo: ${voiceUrl}\n👉 💬 WhatsApp Agent: ${waUrl}\n\nWe're offering a 7-Day Free Pilot ($0 setup) to 3 agencies this week. Would you like to test it out?\n\nReply right here or message me on WhatsApp at ${myWhatsApp} to claim a spot!\n\nBest regards,\nSuhail Ahmed`;
  } else if (clientId.includes('medspa')) {
    subject = `Consultation bookings for ${businessName}? (30-sec demo)`;
    emailBody = `Hi ${businessName} Team,\n\nClients calling for Botox, facials, or body contouring often call during evenings or lunch when phones are busy.\n\nOur 24/7 Voice & WhatsApp AI Receptionists answer instantly, explain treatment options, and book consultations directly onto your booking calendar.\n\nCheck your customized 30-second demos:\n👉 🎙️ Voice Call Demo: ${voiceUrl}\n👉 💬 WhatsApp Agent: ${waUrl}\n\nWe are offering an introductory 7-Day Free Pilot ($0 setup fee). Would you be open to a quick chat this week?\n\nBest regards,\nSuhail Ahmed\nNexus AI Solutions\n📲 Direct WhatsApp: ${myWhatsApp}\n👉 Chat on WhatsApp: ${myWaDirectLink}`;
    waMessage = `Hi ${businessName} Team,\n\nQuick 30-second live demos of our 24/7 AI Receptionist customized for aesthetic clinics:\n👉 🎙️ Voice Call: ${voiceUrl}\n👉 💬 WhatsApp: ${waUrl}\n\nIt books consultations 24/7 so you never lose high-value patients. We're offering a 7-Day Free Pilot ($0 setup fee) this week if you'd like to test it out!\n\nReply right here or message me on WhatsApp at ${myWhatsApp} to claim a spot!\n\nBest regards,\nSuhail Ahmed`;
  }

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  if (channel === 'gmail') {
    if (isMobile) {
      const mailtoUrl = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;
      window.location.href = mailtoUrl;
    } else {
      const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;
      window.open(gmailUrl, '_blank');
    }
  } else if (channel === 'wa') {
    const cleanPhone = (phone || '').replace(/[^0-9]/g, '');
    let waUrl = '';
    if (cleanPhone) {
      waUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(waMessage)}`;
    } else {
      waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(waMessage)}`;
    }
    if (isMobile) {
      window.location.href = waUrl;
    } else {
      window.open(waUrl, '_blank');
    }
  }
}

function triggerSprintAction(leadId, businessName, clientId, email, phone, channel) {
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const status = getLeadSprintStatus(leadId);
  if (channel === 'gmail') {
    status.gmailSent = true;
    status.gmailTime = timeStr;
  } else if (channel === 'wa') {
    status.waSent = true;
    status.waTime = timeStr;
  }
  status.sent = true;

  // Save to localStorage immediately
  localStorage.setItem(`nexus_sprint_${leadId}`, JSON.stringify(status));

  // Re-render UI to update buttons and progress bar instantly
  renderSprintLeads(currentSprintDay);

  // Trigger the actual 1-click action (opens Gmail or WhatsApp)
  quickLeadAction(businessName, clientId, email, phone, channel);
}

function resetSprintLead(leadId) {
  localStorage.removeItem(`nexus_sprint_${leadId}`);
  renderSprintLeads(currentSprintDay);
}

function resetSprintState() {
  if (confirm("Kya aap aaj ke sprint ki status reset karna chahte hain?")) {
    const leads = SPRINT_LEADS[currentSprintDay] || [];
    leads.forEach(l => localStorage.removeItem(`nexus_sprint_${l.id}`));
    renderSprintLeads(currentSprintDay);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('clientsGrid')) {
    loadDashboard();
    
    // Initialize Deal Closing WhatsApp Input from storage
    const closingInput = document.getElementById('myDealClosingWhatsApp');
    if (closingInput) {
      closingInput.value = getDealClosingWhatsApp();
    }

    setTimeout(updateHubPitchPreview, 500);
    renderSprintLeads(1);
  }
});


