# SecureAI: AI-Driven SOC Co-Pilot

**An intelligent Security Operations Center (SOC) assistant that helps analysts investigate threats using natural language.**

Built for **Hack The Core 2026 – Topic 04: Security Operations Agent**

---

## 👥 Team
**Brain Byte**
Hack The Core 2026 — Topic 04: Security Operations Agent

## ✨ About the Project

SecureAI is an AI-powered SOC Co-Pilot that enables security teams to investigate threats through natural language queries. It correlates events from multiple sources, reconstructs attack timelines, maps threats to the MITRE ATT&CK framework, calculates CVSS and EPSS scores, and suggests actionable response steps.

The system focuses on **reliability**, **explainability**, and **evidence-based insights** to minimize hallucinations and provide trustworthy assistance to SOC analysts.

## 🎯 Key Features

- Natural language querying over security events
- Real-time Attack Timeline reconstruction
- Deep MITRE ATT&CK mapping (Tactics, Techniques & Sub-techniques)
- CVSS v3.1 and EPSS scoring display
- Risk filtering (Critical, High, Medium, Low, All)
- Actionable SOAR-style recommendations (Block IP, Isolate, etc.)
- Modern cyberpunk UI with scanlines, glow effects and live status

## 🛠️ Tech Stack

### Frontend
- React.js + Vite
- Custom CSS with JetBrains Mono and Syne fonts

### Backend & AI
- Python
- NLP-based query processing
- Secure prompt engineering

### Frameworks
- MITRE ATT&CK
- CVSS v3.1
- EPSS (Exploit Prediction Scoring System)

## 🚀 How to Run

### Prerequisites
- Node.js (v18+)
- Python 3.10+

### Backend
```bash
cd ai_engine
pip install -r requirements.txt
python main.py

### Frontend
cd client
npm install
npm run dev

Open http://localhost:5173 in your browser.

## 📝 Sample Queries

What is the IP 192.168.1.45 doing?
Summarize the attack chain
Show failed logins
Investigate 10.0.0.99
Recommend containment steps

## 🧠 Highlights

Evidence-grounded AI responses referencing actual events and timestamps
Multi-source log correlation (firewall, auth, cloud)
Clean empty state when no events are present
Responsive risk-based filtering and summary dashboard