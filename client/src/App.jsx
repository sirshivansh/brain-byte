import { useState, useEffect } from "react";
import AttackTimeline from "./components/AttackTimeline";

function App() {
const [timelineEvents, setTimelineEvents] = useState([]);
const [query, setQuery] = useState("");

useEffect(() => {
const sampleData = [
{
timestamp: "2026-04-03 14:05:12",
source: "firewall",
description: "Port scan detected on port 3389",
mitre: "T1190 - Exploit Public-Facing Application",
risk: "high",
ip: "192.168.1.45",
},
{
timestamp: "2026-04-03 14:07:33",
source: "auth",
description: "5 failed login attempts",
mitre: "T1110 - Brute Force",
risk: "critical",
ip: "192.168.1.45",
user: "admin",
},
{
timestamp: "2026-04-03 14:12:09",
source: "cloud",
description: "Successful login + 2.4 GB data export",
mitre: "T1020 - Automated Exfiltration",
risk: "critical",
ip: "192.168.1.45",
user: "admin",
},
];


setTimelineEvents(sampleData);


}, []);

const handleAskSecureAI = () => {
if (!query.trim()) return;
alert(`SecureAI received: "${query}"`);
setQuery("");
};

return ( <div className="min-h-screen bg-gray-950 text-white">


  {/* HEADER */}
  <header className="border-b border-gray-700 bg-gray-900 p-4 flex justify-between items-center">
    <h1 className="text-2xl font-bold text-cyan-400">SecureAI</h1>

    <div className="flex gap-2">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleAskSecureAI()}
        placeholder="Ask SecureAI..."
        className="px-4 py-2 rounded bg-gray-800 border border-gray-600 outline-none"
      />
      <button
        onClick={handleAskSecureAI}
        className="bg-cyan-400 text-black px-4 py-2 rounded font-semibold"
      >
        Ask
      </button>
    </div>
  </header>

  <div className="flex h-[calc(100vh-60px)]">
    
    {/* LEFT PANEL */}
    <div className="w-64 bg-gray-900 p-4 border-r border-gray-800">
      <h3 className="text-gray-400 mb-4">Filters</h3>
      <button className="block w-full mb-2 bg-red-500/20 text-red-400 p-2 rounded">
        Critical
      </button>
      <button className="block w-full bg-orange-500/20 text-orange-400 p-2 rounded">
        High
      </button>
    </div>

    {/* TIMELINE */}
    <div className="flex-1 p-6 overflow-auto">
      <AttackTimeline events={timelineEvents} />
    </div>

    {/* RIGHT PANEL */}
    <div className="w-72 bg-gray-900 p-4 border-l border-gray-800">
      <h3 className="text-gray-400 mb-2">Logs</h3>

      <pre className="bg-black/60 p-3 rounded text-xs">


{`Firewall → Port scan
Auth → Failed logins
Cloud → Data export`} </pre> </div>


  </div>
</div>


);
}

export default App;
