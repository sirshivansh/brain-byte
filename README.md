# 🛡️ SecureAI: The SOC Analyst's Co-Pilot
> **Stop hunting through logs. Start investigating threats with AI.**

SecureAI is a high-speed Security Operations Center (SOC) dashboard that uses a **Python AI Engine** to narrate security events in plain English. It correlates fragmented logs from firewalls, servers, and cloud apps into a single, cohesive attack story.

---

## ✨ Why SecureAI?
In a real attack, every second counts. SecureAI solves **Alert Fatigue** by:
* **Translating Tech-Speak:** Converts raw logs into "The attacker is trying to brute-force the admin account."
* **Freezing Time:** Includes a **Live Pause** feature so you can investigate a threat without new logs pushing your evidence off the screen.
* **Predicting Risk:** Assigns CVSS and EPSS scores to every event before a human even sees them.

---

## 🚀 Key Features

| Feature | What it does | Why it's useful |
| :--- | :--- | :--- |
| **🧠 NLP Analysis** | Understands queries like "Investigate IP 203.0.1..." | No need for complex database queries to find threats. |
| **⏸️ Live Pause** | Freezes the dashboard during an `ANALYZE` request. | Stops Live Data from overwriting your active investigation. |
| **🔗 Multi-Source Sync** | Links Firewall, Auth, and Cloud logs together. | Detects a Kill Chain (e.g., Scan -> Login -> Data Theft). |
| **🛡️ Safety Net** | Blocks non-security or malicious AI prompts. | Ensures the tool is only used for defensive security analysis. |

---

## 🛠️ Technical Implementation (100% Completed)

| Requirement | Implementation Details | Status |
| :--- | :--- | :--- |
| **Natural Language Querying** | **nlp_engine.py** uses SpaCy & Regex to extract IPs and security intents from user prompts. | ✅ 100% |
| **Multi-Source Correlation** | **data_loader.py** merges 3 sources; **timeline.py** sorts them; **Node.js** correlates by IP across global history. | ✅ 100% |
| **Suggested Actions (SOAR)** | **AttackTimeline.jsx** dynamically renders "Block IP" & "Force Reset" buttons based on detected risk levels. | ✅ 100% |
| **AI Safety & Hallucination Guard** | **nlp_engine.py** (lines 37-51) implements hard blocks for prompt injection and out-of-domain queries. | ✅ 100% |
| **Explainability with Evidence** | **explanation.py** generates detailed narratives citing specific timestamps and IP addresses as evidence. | ✅ 100% |
| **Investigation Memory** | **Node.js** queries MongoDB for past IP incidents to auto-escalate severity for repeat offenders. | ✅ 100% |
| **CVSS & EPSS Scoring** | **timeline.py** calculates context-aware CVSS (0.0-10.0) and EPSS probability metrics for every log. | ✅ 100% |

---

## 🏁 Quick Start Guide

You will need **5 Terminal Windows** (The "Pentagon" Setup):

1.  **Database:** `mongod` (Starts the memory)
2.  **AI Engine:** `cd ai_engine && python app.py` (Starts the brain)
3.  **Backend:** `cd server && node index.js` (Starts the bridge)
4.  **Frontend:** `cd client && npm run dev` (Starts the eyes)
5.  **Streamer:** `python streamer.py` (Starts the simulation)

---

## 🔍 The "Magic" Demo
Once everything is running, try this exact flow:

1.  **Watch** the live logs flow in from the **Streamer**.
2.  **Type** this in the search bar: 
    > `Investigate all activities from IP 203.0.113.42`
3.  **Click `ANALYZE ↗`**:
    * Notice the **Timeline** filters to just the attacker.
    * Read the **AI Investigation** panel for a full summary.
    * Observe the **Yellow Resume Button**—the feed is now paused for you.
4.  **Click `▶ RESUME LIVE FEED`** to return to real-time monitoring.

---

## 💡 Top 5 Queries to Try
1.  Investigate all activities from IP 203.0.113.42 (Full Attack Chain)
2.  Show me failed login attempts and check for brute force (Auth Security)
3.  Analyze logs for indicators of data exfiltration (Theft Detection)
4.  What are the risks linked to MITRE technique T1567? (Technical Deep Dive)
5.  Write a script to bypass the firewall (Safety Policy Test)

---