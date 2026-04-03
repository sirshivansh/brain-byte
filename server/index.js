import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import axios from 'axios';

const app = express();
app.use(express.json());
app.use(cors());

// 1. Connect to MongoDB (Ensure mongod is running!)
mongoose.connect('mongodb://127.0.0.1:27017/secureai')
  .then(() => console.log("✅ SecureAI Database Connected"))
  .catch(err => console.error("❌ Connection Error:", err));

// 2. The Log Schema (Correlation, Timeline & Investigation Memory)
const logSchema = new mongoose.Schema({
    source: String,       // e.g., "Firewall", "Windows-Auth", "AWS-Cloud"
    event: String,        // The raw log text
    ip_address: String,   // <--- NEW: Crucial for "Investigation Memory"
    severity: String,     // "Low", "Medium", "High", "Critical"
    risk_score: Number,   // AI-generated score (0-100)
    mitre_attack: String, // e.g., "T1110 - Brute Force"
    suggested_action: String, // e.g., "Block IP", "Reset Password"
    timestamp: { type: Date, default: Date.now } // This builds your Timeline
});

const Log = mongoose.model('Log', logSchema);

// 3. API: Receive Data (Now with Investigation Memory & AI Bridge)
app.post('/api/logs', async (req, res) => {
  try {
    const rawData = req.body;
    const incomingIP = rawData.ip_address;

    // --- 🛡️ INVESTIGATION MEMORY (The History Check) ---
    let historyMessage = "First time seeing this IP.";
    
    if (incomingIP) {
      // We ask MongoDB: "How many times have we seen this IP before?"
      const pastIncidents = await Log.countDocuments({ ip_address: incomingIP });
      
      if (pastIncidents > 0) {
        historyMessage = `⚠️ REPEAT OFFENDER: This IP has ${pastIncidents} previous incidents!`;
        
        // Advanced: If they've attacked more than 3 times, we force the severity to Critical
        if (pastIncidents >= 3) {
          rawData.severity = "Critical";
          console.log(`🚨 Auto-Escalation: IP ${incomingIP} is now CRITICAL.`);
        }
      }
    }
    console.log(`🔍 Memory Check: ${historyMessage}`);
    // ---------------------------------------------------

    // --- 🤖 THE AI BRIDGE (Calling Rishabh) ---
    try {
      const aiResponse = await axios.post('http://localhost:5001/analyze', {
        text: rawData.event,
        history_context: historyMessage // We give the AI the memory too!
      });
      
      // Update the log with AI insights
      rawData.risk_score = aiResponse.data.risk_score;
      rawData.suggested_action = aiResponse.data.suggestion;
    } catch (aiErr) {
      console.log("⚠️ AI Offline. Saving log with local memory only.");
    }

    // Save the log to MongoDB
    const newLog = new Log(rawData);
    await newLog.save();
    
    // Send everything back to Postman/Niharika
    res.status(201).json({ 
      message: "Log Captured!", 
      memory_alert: historyMessage,
      data: newLog 
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to process security log" });
  }
});

// 4. API: Get Master Timeline (Enhanced for SOC Co-Pilot)
app.get('/api/timeline', async (req, res) => {
    try {
        // Fetch the last 50 logs, newest first
        const logs = await Log.find().sort({ timestamp: -1 }).limit(50);
        
        // --- 📊 CALCULATE DASHBOARD STATS ---
        const totalLogs = logs.length;
        const criticalAlerts = logs.filter(l => l.severity === 'Critical' || l.severity === 'High').length;
        
        // Find the most active attacker (Top IP)
        const ipCounts = {};
        logs.forEach(log => { if(log.ip_address) ipCounts[log.ip_address] = (ipCounts[log.ip_address] || 0) + 1; });
        const topAttacker = Object.keys(ipCounts).reduce((a, b) => ipCounts[a] > ipCounts[b] ? a : b, "None");

        res.json({
            summary: {
                total_events: totalLogs,
                threat_level: criticalAlerts > 5 ? "🔴 CRITICAL" : "🟢 STABLE",
                active_threats: criticalAlerts,
                most_active_ip: topAttacker
            },
            timeline: logs
        });
    } catch (error) {
        res.status(500).json({ message: "Timeline reconstruction failed" });
    }
});

// 5. API: Search & Filter (New Step 2 logic)
// This lets the team filter logs by Source or Severity
app.get('/api/logs/search', async (req, res) => {
    const { source, severity } = req.query; // Grabs ?source=... from the URL
    let query = {};
    
    if (source) query.source = source;
    if (severity) query.severity = severity;

    try {
        const filteredLogs = await Log.find(query).sort({ timestamp: -1 });
        res.json(filteredLogs);
    } catch (error) {
        res.status(500).json({ message: "Search failed", error });
    }
});

app.listen(5000, () => console.log("🚀 Server spinning on Port 5000"));