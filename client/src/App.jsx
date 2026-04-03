import { useState, useEffect } from "react";
import AttackTimeline from "./components/AttackTimeline";

function App() {
  const [timelineEvents, setTimelineEvents] = useState([]);
  const [query, setQuery] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [toast, setToast] = useState(null); // 🟢 Toast State
  const [displayedResponse, setDisplayedResponse] = useState(""); // 🟢 NEW: For typing effect
  const [isLoading, setIsLoading] = useState(false); // 🟢 NEW
  const [activeFilter, setActiveFilter] = useState("all"); // 🟢 NEW
  
  useEffect(() => {
    // Initial hardcoded data
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

    // 🟢 TYPING ANIMATION EFFECT
  useEffect(() => {
    if (!aiResponse) {
      setDisplayedResponse("");
      return;
    }

    let index = 0;
    const timer = setInterval(() => {
      setDisplayedResponse(aiResponse.substring(0, index + 1));
      index++;
      if (index >= aiResponse.length) {
        clearInterval(timer);
      }
    }, 15); // Speed of typing (lower = faster)

    return () => clearInterval(timer);
  }, [aiResponse]);

  const handleAskSecureAI = async () => {
    if (!query) return;
    setIsLoading(true); // 🟢 START SPINNER
    setAiResponse("");  // Clear old text

    try {
      const res = await fetch("/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: query }),
      });

      const data = await res.json();
      console.log("FULL RESPONSE:", data);

      if (data.timeline) {
        setTimelineEvents(data.timeline);
      }

      if (data.response) {
        setAiResponse(data.response);
      } else if (data.message) {
        setAiResponse(data.message);
      }

      setQuery("");
    } catch (error) {
      console.error("Error:", error);
      setAiResponse("⚠️ Server error. Is the Python backend running?");
    } finally {
      setIsLoading(false); // 🟢 STOP SPINNER
    }
  };

  // 🟢 TOAST ACTION HANDLER
  const handleAction = (actionType, details) => {
    setToast(`${actionType} executed for ${details}`);
    setTimeout(() => setToast(null), 3000); // Disappear after 3 seconds
  };

  // 🟢 FILTER LOGIC FOR LEFT PANEL
  const filteredEvents = activeFilter === "all" 
    ? timelineEvents 
    : timelineEvents.filter(event => event.risk === activeFilter);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* HEADER */}
      <header className="border-b border-gray-700 bg-gray-900 p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-cyan-400">🛡️ SecureAI Co-Pilot</h1>
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAskSecureAI()}
            placeholder="Ask SecureAI... (e.g., Show failed logins)"
            className="px-4 py-2 rounded bg-gray-800 border border-gray-600 outline-none w-96 focus:border-cyan-500 transition"
          />
          <button
            onClick={handleAskSecureAI}
            className="bg-cyan-500 hover:bg-cyan-600 text-black px-6 py-2 rounded font-semibold transition"
          >
            Analyze
          </button>
        </div>
      </header>

      <div className="flex h-[calc(100vh-60px)]">
        {/* LEFT PANEL */}
        <div className="w-64 bg-gray-900 p-4 border-r border-gray-800 flex flex-col">
          <h3 className="text-gray-400 mb-4 font-semibold">Filter by Risk</h3>
          
          <button 
            onClick={() => setActiveFilter("all")}
            className={`w-full mb-2 p-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
              activeFilter === "all" ? "bg-cyan-500 text-black shadow-lg shadow-cyan-500/30" : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            🌐 Show All
          </button>

          <button 
            onClick={() => setActiveFilter("critical")}
            className={`w-full mb-2 p-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
              activeFilter === "critical" ? "bg-red-500 text-white shadow-lg shadow-red-500/30" : "bg-red-500/10 text-red-400 hover:bg-red-500/20"
            }`}
          >
            🔴 Critical
          </button>

          <button 
            onClick={() => setActiveFilter("high")}
            className={`w-full mb-2 p-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
              activeFilter === "high" ? "bg-orange-500 text-white shadow-lg shadow-orange-500/30" : "bg-orange-500/10 text-orange-400 hover:bg-orange-500/20"
            }`}
          >
            🟠 High
          </button>

          <button 
            onClick={() => setActiveFilter("medium")}
            className={`w-full mb-2 p-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
              activeFilter === "medium" ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30" : "bg-blue-500/10 text-blue-400 hover:bg-blue-500/20"
            }`}
          >
            🔵 Medium
          </button>
          <button 
            onClick={() => setActiveFilter("low")}
            className={`w-full mb-2 p-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
              activeFilter === "low" ? "bg-gray-500 text-white shadow-lg shadow-gray-500/30" : "bg-gray-500/10 text-gray-400 hover:bg-gray-500/20"
            }`}
          >
            ⚪ Low
          </button>
        </div>

        {/* TIMELINE */}
        <div className="flex-1 p-6 overflow-auto">
          {timelineEvents.length === 0 ? (
            /* When the AI finds NO logs at all (e.g., fake IP) */
            <div className="flex flex-col items-center justify-center h-full text-gray-600">
              <span className="text-5xl mb-4">🔍</span>
              <p className="text-xl font-semibold">No Threats Detected</p>
              <p className="text-sm mt-2">Try asking about IP 192.168.1.45</p>
            </div>
          ) : filteredEvents.length === 0 ? (
            /* When logs exist, but the filter (e.g., Medium) finds nothing */
            <div className="flex flex-col items-center justify-center h-full text-gray-600">
              <span className="text-5xl mb-4">🛡️</span>
              <p className="text-xl font-semibold">No {activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)} Risk Records Found</p>
              <p className="text-sm mt-2">Try selecting a different risk filter</p>
            </div>
          ) : (
            /* Normal state: Show the timeline */
            <AttackTimeline events={filteredEvents} onAction={handleAction} />
          )}
        </div>

        {/* RIGHT PANEL */}
        <div className="w-80 bg-gray-900 p-4 border-l border-gray-800 flex flex-col">
          <h3 className="text-gray-400 mb-4 font-semibold border-b border-gray-700 pb-2">
            🤖 AI Investigation
          </h3>

          {/* AI Response Box */}
          <div className="flex-1 mb-4">
            {displayedResponse ? (
              <div className="bg-gray-800/50 border border-cyan-500/30 p-4 rounded-lg text-sm text-cyan-100 leading-relaxed">
                {displayedResponse}
                {/* 🟢 ADD A BLINKING CURSOR AT THE END */}
                {displayedResponse.length !== aiResponse.length && <span className="animate-pulse">|</span>}
              </div>
            ) : isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="ml-3 text-cyan-400 text-sm">Analyzing logs...</span>
              </div>
            ) : (
              <p className="text-gray-600 text-sm italic">
                Ask a question to start investigation...
              </p>
            )}
          </div>

          {/* Raw Logs Section */}
          <div>
            <h3 className="text-gray-400 mb-2 font-semibold border-t border-gray-700 pt-4">
              📋 Raw Logs
            </h3>
            <pre className="bg-black/60 p-3 rounded text-xs text-gray-500 h-40 overflow-auto">
              {timelineEvents.length > 0 ? (
                timelineEvents.map((log, index) => (
                  <div key={index} className="mb-1">
                    <span className="text-cyan-600">
                      {log.source?.toUpperCase()}
                    </span>{" "}
                    → {log.description}
                  </div>
                ))
              ) : (
                "No logs loaded yet..."
              )}
            </pre>
          </div>
        </div>
      </div>

      {/* 🟢 TOAST NOTIFICATION UI */}
      {toast && (
        <div className="fixed bottom-8 right-8 bg-green-600 text-white px-6 py-3 rounded-lg shadow-2xl animate-bounce z-50 font-semibold">
          ✅ {toast}
        </div>
      )}
    </div>
  );
}

export default App;