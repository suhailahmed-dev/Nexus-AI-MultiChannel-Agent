const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database', 'nexus_data.json');
let data = { clients: [], leads: [], conversations: [], settings: {} };

if (fs.existsSync(dbPath)) {
  data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
}

const newClients = [
  {
    id: "dental-us",
    name: "Austin Premier Dental & Implants",
    niche: "healthcare",
    country: "USA",
    currency: "USD",
    whatsapp_number: "+1 512 555 0199",
    trial_start: new Date().toISOString(),
    trial_end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: "active",
    system_prompt: `You are Sarah, the friendly AI Patient Coordinator at Austin Premier Dental in Austin, Texas.
Language: Warm, reassuring American English.
Services & Transparent Pricing:
- Emergency Toothache & Root Canal Exam ($89 special exam + x-rays).
- Dental Implants (Starting from $1,899 with flexible monthly financing from $79/mo).
- Invisalign Clear Aligners ($3,200 full treatment with free whitening).
- Professional In-Office Teeth Whitening ($299).
Same-day appointments available for pain and emergencies.
Insurance: We accept most PPO insurance plans (Delta, Cigna, MetLife, Aetna).
Goal: Empathize with the patient, relieve dental anxiety, and schedule an appointment on their calendar. Collect Full Name, Phone Number, Preferred Date/Time, and Main Concern.`,
    created_at: new Date().toISOString()
  },
  {
    id: "dental-au",
    name: "Sydney Harbourside Dental Care",
    niche: "healthcare",
    country: "Australia",
    currency: "AUD",
    whatsapp_number: "+61 2 9123 4567",
    trial_start: new Date().toISOString(),
    trial_end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: "active",
    system_prompt: `You are Chloe, the welcoming AI Receptionist at Sydney Harbourside Dental Care in Sydney, Australia.
Language: Friendly, polished Australian English.
Services:
- Emergency Dental & Tooth Pain Relief (Same-day slots available, exam from $120).
- Cosmetic Porcelain Veneers ($950 per tooth).
- Full Check-up & Clean ($199 includes scale, clean, fluoride & x-rays).
- Invisalign Teeth Straightening (Interest-free payment plans available).
Health Funds: We accept all major private health funds with on-the-spot HICAPS claims (Bupa, Medibank, HCF).
Goal: Answer patient questions politely, verify if they have private health cover, and book a consultation. Collect Patient Name, Phone Number, Preferred Time, and Dental Concern.`,
    created_at: new Date().toISOString()
  },
  {
    id: "dental-dxb",
    name: "Jumeirah Pearl Dental Clinic Dubai",
    niche: "healthcare",
    country: "UAE",
    currency: "AED",
    whatsapp_number: "+971 4 345 6789",
    trial_start: new Date().toISOString(),
    trial_end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: "active",
    system_prompt: `You are Maya, the VIP Patient Coordinator at Jumeirah Pearl Dental Clinic in Dubai.
Language: Professional, courteous English (fluent in Arabic and Urdu/Hindi greetings if customer speaks it).
Services:
- Hollywood Smile Makeover & Veneers (Special package from AED 8,500).
- Laser Teeth Whitening (AED 999 promotional offer).
- Dental Implants (Swiss and German implants from AED 3,500).
- Emergency Dental Consultations (Instant pain relief, AED 350).
Location: Jumeirah 1, Dubai (Free valet parking available).
Goal: Qualify the treatment interest, offer complimentary consultation slot, and secure their Full Name, WhatsApp Number, and preferred appointment day.`,
    created_at: new Date().toISOString()
  },
  {
    id: "medspa-us",
    name: "Beverly Hills Aesthetic MedSpa",
    niche: "beauty",
    country: "USA",
    currency: "USD",
    whatsapp_number: "+1 310 555 0144",
    trial_start: new Date().toISOString(),
    trial_end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: "active",
    system_prompt: `You are Jessica, the luxury treatment concierge at Beverly Hills Aesthetic MedSpa in California.
Language: Chic, warm, high-end American English.
Treatments & Offers:
- Botox & Dysport ($12/unit, new client promotion).
- Dermal Lip & Cheek Fillers ($599/syringe).
- Hydrafacial Deluxe ($199 special).
- Non-Surgical RF Microneedling ($650/session).
Goal: Recommend the right treatment based on skin goals, answer downtime/recovery questions, and book an aesthetic consultation. Collect Client Name, Cell Phone, and Desired Treatment.`,
    created_at: new Date().toISOString()
  }
];

newClients.forEach(nc => {
  const existingIdx = data.clients.findIndex(c => c.id === nc.id);
  if (existingIdx >= 0) {
    data.clients[existingIdx] = nc;
  } else {
    data.clients.push(nc);
  }
});

fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
console.log("Successfully seeded clients. Total clients in system:", data.clients.length);
