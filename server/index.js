import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// 1. Connect to your local MongoDB [cite: 22, 24, 25]
mongoose.connect('mongodb://127.0.0.1:27017/secureai')
    .then(() => console.log("✅ Brain Byte Database Connected"))
    .catch(err => console.error("❌ MongoDB Connection Error:", err));

// 2. The "Log Schema" (This handles Multi-Source Correlation) [cite: 4]
const logSchema = new mongoose.Schema({
    source: String,      // Firewall, Auth, Cloud, etc. [cite: 4]
    event: String,       // The raw log text
    severity: String,    // High, Medium, Low
    risk_score: Number,  // From Rishabh's AI
    mitre_attack: String, // From Piyusha's mapping [cite: 4]
    timestamp: { type: Date, default: Date.now } // For the Timeline [cite: 4]
});

const Log = mongoose.model('Log', logSchema);

// 3. API Route: Get Attack Timeline [cite: 4]
app.get('/api/timeline', async (req, res) => {
    try {
        const logs = await Log.find().sort({ timestamp: -1 }); // Newest first
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: "Error fetching timeline" });
    }
});

// 4. API Route: Receive & Store Log
app.post('/api/logs', async (req, res) => {
    try {
        const newLog = new Log(req.body);
        await newLog.save();
        res.status(201).json({ message: "Log stored and correlated!" });
    } catch (error) {
        res.status(400).json({ message: "Error saving log" });
    }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Hub running on http://localhost:${PORT}`));