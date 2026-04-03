import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(cors());

// 1. Connect to MongoDB (Ensure mongod is running!)
mongoose.connect('mongodb://127.0.0.1:27017/secureai')
  .then(() => console.log("✅ SecureAI Database Connected"))
  .catch(err => console.error("❌ Connection Error:", err));

// 2. The Log Schema (Correlation & Timeline)
const logSchema = new mongoose.Schema({
  source: String,      // Firewall, Auth, Cloud, etc.
  event: String,       // Raw log text
  severity: String,    // High, Medium, Low
  risk_score: Number,  // From Rishabh's AI
  mitre_attack: String, // From Piyusha's mapping
  timestamp: { type: Date, default: Date.now }
});

const Log = mongoose.model('Log', logSchema);

// 3. API: Receive Data (The Bridge)
app.post('/api/logs', async (req, res) => {
  try {
    const newLog = new Log(req.body);
    await newLog.save();
    res.status(201).json({ message: "Log Captured!" });
  } catch (error) {
    res.status(500).json({ error: "Failed to save log" });
  }
});

// 4. API: Get Timeline (For Niharika's UI)
app.get('/api/timeline', async (req, res) => {
  const logs = await Log.find().sort({ timestamp: -1 });
  res.json(logs);
});

app.listen(5000, () => console.log("🚀 Server spinning on Port 5000"));