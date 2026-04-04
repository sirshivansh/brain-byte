import React from 'react';
import { VerticalTimeline, VerticalTimelineElement } from 'react-vertical-timeline-component';
import 'react-vertical-timeline-component/style.min.css';
import { FaShieldAlt, FaExclamationTriangle, FaBan, FaKey } from 'react-icons/fa';

const AttackTimeline = ({ events, onAction }) => {
  const getIcon = (risk) => {
    if (risk === 'critical') return <FaExclamationTriangle className="text-red-500" />;
    if (risk === 'high') return <FaExclamationTriangle className="text-orange-500" />;
    if (risk === 'medium') return <FaShieldAlt className="text-yellow-400" />;
    return <FaShieldAlt className="text-gray-400" />; // Low / Default
  };

  return (
    <div className="bg-gray-950 p-8 rounded-3xl border border-cyan-500/30">
      <h2 className="text-3xl font-bold text-white flex items-center gap-3 mb-8">
        🔥 Attack Reconstruction Timeline
      </h2>

      <VerticalTimeline layout="1-column-left" lineColor="#22d3ee">
        {events.map((event, index) => (
          <VerticalTimelineElement
            key={index}
            date={event.timestamp}
            dateClassName="text-cyan-300 font-mono text-sm"
            icon={getIcon(event.risk)}
            iconStyle={{
              background: event.risk === 'critical' ? '#ef4444' : 
                          event.risk === 'high' ? '#f97316' : 
                          event.risk === 'medium' ? '#eab308' : '#6b7280',
              color: '#fff',
              boxShadow: '0 0 0 4px #22d3ee',
            }}
            contentStyle={{
              background: '#111827',
              borderRadius: '16px',
              boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.4)',
            }}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <span className="px-4 py-1 text-xs font-mono bg-gray-900 text-cyan-400 rounded-2xl">
                  {event.source.toUpperCase()}
                </span>
                <h4 className="text-white text-xl font-semibold mt-4">{event.description}</h4>
                
                <div className="flex items-center gap-3 mt-2 text-xs">
                  <span className="bg-gray-800 px-2 py-1 rounded font-mono text-white">
                    {event.risk.toUpperCase()}
                  </span>

                  <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded">
                    CVSS {event.cvss?.toFixed(1)}
                  </span>

                  <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded">
                    EPSS {(event.epss * 100).toFixed(0)}%
                  </span>
                </div>

                {/* 🧠 ENTERPRISE METRICS (CVSS + EPSS) */}
                <div className="flex items-center gap-4 mt-3">
                  <div className={`px-3 py-1 rounded-lg text-xs font-bold ${
                    event.cvss >= 9 ? "bg-red-500/20 text-red-400 border border-red-500/50" : 
                    event.cvss >= 7 ? "bg-orange-500/20 text-orange-400 border border-orange-500/50" : 
                    "bg-gray-500/20 text-gray-400 border border-gray-500/50"
                  }`}>
                    CVSS {event.cvss.toFixed(1)}
                  </div>

                  <div className={`px-3 py-1 rounded-lg text-xs font-bold ${
                    event.epss >= 0.8 ? "bg-red-500/20 text-red-400 border border-red-500/50" :
                    event.epss >= 0.5 ? "bg-orange-500/20 text-orange-400 border border-orange-500/50" :
                    "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30"
                  }`}>
                    EPSS: {(event.epss * 100).toFixed(0)}%
                  </div>
                </div>

                <div className="mt-3 text-sm">
                  {typeof event.mitre === "object" ? (
                    <div className="text-purple-400 font-mono">
                      {event.mitre.subtechnique} – {event.mitre.name}
                    </div>
                  ) : (
                    <div className="text-emerald-400">{event.mitre}</div>
                  )}
                </div>

                {event.ip && <p className="text-gray-400 text-sm mt-2">IP: <span className="font-mono">{event.ip}</span></p>}
                {event.user && <p className="text-gray-400 text-sm">User: {event.user}</p>}
              </div>

              {/* Show action buttons for Critical, High, and Medium risks */}
              {(event.risk === 'high' || event.risk === 'critical' || event.risk === 'medium') && (
                <div className="flex flex-col gap-3 ml-8">
                  <button
                    onClick={() => onAction("IP Blocked", event.ip)}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-6 py-3 rounded-2xl text-white text-sm font-medium"
                  >
                    <FaBan /> Block IP
                  </button>
                  <button
                    onClick={() => onAction("Password Reset", event.user)}
                    className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 px-6 py-3 rounded-2xl text-white text-sm font-medium"
                  >
                    <FaKey /> Force Reset
                  </button>
                </div>
              )}
            </div>
          </VerticalTimelineElement>
        ))}
      </VerticalTimeline>
    </div>
  );
};

export default AttackTimeline;