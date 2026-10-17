# 🚀 Nexus AI — Autonomous Multi-Channel Sales & Voice Receptionist Engine

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express.js-Backend-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com)
[![Gemini AI](https://img.shields.io/badge/Google_Gemini-API-8E75C2?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev)
[![WhatsApp](https://img.shields.io/badge/WhatsApp-Cloud_Webhook-25D366?style=for-the-badge&logo=whatsapp&logoColor=white)](https://whatsapp.com)
[![Live Portfolio](https://img.shields.io/badge/Architect_Portfolio-Live_Showcase-14B8A6?style=for-the-badge&logo=safari&logoColor=white)](https://suhailahmed-dev.github.io/portfolio/)

**Nexus AI** is an enterprise-grade, multi-tenant AI receptionist and sales agent platform engineered to capture leads, book appointments, and provide instant 24/7 customer support across **WhatsApp**, **Web Voice Calling**, and **Embeddable Website Widgets**.

Built with a native **7-Day Client Trial Funnel**, Nexus AI enables agencies to onboard local and international businesses (clinics, real estate agencies, law firms, e-commerce brands) with zero upfront friction, automated trial expiration gates, and instant Google Sheets CRM syncing.

---

## 🏗️ System Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                      INBOUND MULTI-CHANNEL CLIENTS                    │
│   [ WhatsApp Webhook ]   [ Browser Voice Call Lab ]   [ Web Widget ]   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ (JSON / Audio / Text Payloads)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   NEXUS CORE DISPATCHER (Node / Express)               │
│                                                                        │
│   • Multi-Tenant Business Isolation (Client Profiles & FAQ Blueprints)  │
│   • 7-Day Free Trial Lifecycle & Expiration Gates                      │
│   • Session State Management & Conversation History Audit Store        │
└───────────────────┬────────────────────────────────┬───────────────────┘
                    │                                │
                    ▼                                ▼
┌──────────────────────────────────────┐  ┌──────────────────────────────┐
│       COGNITIVE REASONING LAYER      │  │      OUTBOUND CRM SYNC       │
│                                      │  │                              │
│ • Google Gemini LLM API              │  │ • Google Sheets Webhook Hook │
│ • Structured Lead Field Extractor    │  │ • Automatic Appointment Log  │
│ • Intelligent Local Fallback Engine  │  │ • Real-time Agency Dashboard │
└──────────────────────────────────────┘  └──────────────────────────────┘
```

---

## ⚡ Core Engineering Capabilities

1. **Multi-Tenant Agency Command Center (`http://localhost:3000`):**
   - High-contrast operational dashboard tracking active client trials, captured customer leads, and business configurations.
   - Dynamic 7-day countdown calculator with visual warning badges (`TRIAL ACTIVE`, `EXPIRED`, `PAID ENTERPRISE`).

2. **Bidirectional Voice Calling Lab (`/call-lab.html`):**
   - Interactive browser-based voice receptionist simulator powered by Web Speech API & audio synthesis.
   - Enables prospective clients to call their customized AI assistant directly from a browser and test real-time conversational latency.

3. **WhatsApp Webhook Simulator & Cloud Adapter (`/demo-lab.html`):**
   - True-to-life WhatsApp UI simulator with real-time typing indicators, automated message threading, and appointment confirmation cards.
   - Cloud API webhook verification routes (`/api/whatsapp/webhook/:clientId`) for production Twilio or Meta Cloud API integration.

4. **Structured Lead & Appointment Extraction:**
   - Automatically parses unstructured customer messages for critical conversion fields: `Full Name`, `Phone Number`, `Requested Service`, `Preferred Date/Time Slot`, and `Booking Notes`.

5. **Zero-Lag Intelligent Fallback Engine:**
   - In environments where external LLM APIs experience rate-limits or network interruptions, Nexus AI falls back to a deterministic, rule-based semantic parser to ensure zero dropped leads.

---

## 🏢 Pre-Seeded Industry Blueprints

The engine ships with pre-configured, battle-tested business profiles:

* 🇺🇸 **Dallas Emergency & Family Dental (USA):** Handles urgent toothache intake, insurance queries, and booking priority dental consultations ($150 - $800 value).
* 🇦🇪 **Dubai Luxury Real Estate Brokerage (UAE):** Qualifies high-net-worth investors, filters off-plan vs secondary market inquiries, and schedules private VIP viewings in Downtown Dubai & Marina.
* 🇦🇺 **Cosmetic Dental & Orthodontics (Australia):** Answers Invisalign, teeth whitening, and general checkup questions with automated Australian timezone slot booking.
* 🇵🇰 **Haute Couture Fashion Boutique (Pakistan):** Manages bridal appointments, custom fitting inquiries, and nationwide delivery FAQs.

---

## 🛠️ Tech Stack & Dependencies

- **Runtime:** Node.js 18+ (ESM / CommonJS)
- **Web Framework:** Express.js 4.x
- **AI / LLM Engine:** Google Gemini API (`@google/genai` compatible REST payload)
- **Database & State:** Local ACID-compliant JSON Store with normalized schemas (`database/db.js`)
- **Integration Sinks:** Google Apps Script Webhooks (Google Sheets CRM)
- **Frontend Labs:** Semantic HTML5, Modern CSS Variables, Vanilla JavaScript (Zero bloated frameworks)

---

## 🚀 Quickstart & Local Installation

### 1. Clone Repository
```bash
git clone https://github.com/suhailahmed-dev/Nexus-AI-MultiChannel-Agent.git
cd Nexus-AI-MultiChannel-Agent
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Edit `.env`:
```env
PORT=3000
GEMINI_API_KEY=your_gemini_api_key_here
GOOGLE_SHEETS_WEBHOOK=https://script.google.com/macros/s/your_macro_id/exec
```

### 4. Launch System
```bash
# Windows 1-Click:
RUN_FULL_SYSTEM.bat

# Or CLI:
npm start
```

Visit:
- 📊 **Agency Dashboard:** `http://localhost:3000`
- 📱 **WhatsApp Live Simulator:** `http://localhost:3000/demo-lab.html?client=dental-us`
- 🎙️ **Voice Calling Lab:** `http://localhost:3000/call-lab.html?client=realestate-dxb`

---

## 👨‍💻 Systems Architect & Author

**Sohail Ahmed Buledi**  
*Systems Architect, Algorithmic Bot Developer & Lead IT Instructor*  
- 🚂 **Interactive Train Portfolio:** [suhailahmed-dev.github.io/portfolio](https://suhailahmed-dev.github.io/portfolio/)  
- 📂 **GitHub Profile:** [github.com/suhailahmed-dev](https://github.com/suhailahmed-dev)  
- 💼 **LinkedIn Profile:** [linkedin.com/in/suhailahmed-dev](https://www.linkedin.com/in/suhailahmed-dev/)  
- ✉️ **Email:** [sohailbuledi84@gmail.com](mailto:sohailbuledi84@gmail.com)  
- 💬 **WhatsApp:** [+92 309 3174020](https://wa.me/923093174020)

---
<p align="center">
  <sub>⚡ Engineered for production reliability, client conversion & zero-touch lead capture • © Sohail Ahmed Buledi</sub>
</p>
