from flask import Flask, request, jsonify
from flask_cors import CORS

from nlp_engine import parse_query
from query_builder import build_query
from timeline import build_timeline, detect_attack, correlate_logs, detect_suspicious_ip
from explanation import (
    generate_explanation,
    suggest_action,
    calculate_risk,
    root_cause_analysis,
    summarize_attack
)
from data_loader import load_logs

app = Flask(__name__)
CORS(app)

# ✅ FIX: Support both React (/ask) and Node.js (/analyze) endpoints
@app.route("/ask", methods=["POST"])
@app.route("/analyze", methods=["POST"])
def process_query():
    try:
        data = request.get_json()
        
        # ✅ FIX: Handle both React ('message') and Node ('text') payloads
        user_query = data.get("message") or data.get("text") if data else None

        print("🔥 USER QUERY:", user_query)

        if not user_query:
            return jsonify({"status": "error", "message": "No query"}), 400

        parsed = parse_query(user_query)
        
        # 🛑 AI SAFETY NET: Reject Injection and Hallucination attempts immediately
        if parsed.get("intent") in ["injection_attempt", "out_of_domain"]:
            return jsonify({
                "status": "success",
                "response": "🛑 Security Policy: As an AI SOC Co-Pilot, I am strictly restricted to analyzing security logs. I cannot process general queries, jokes, or system prompt instructions to prevent hallucination and prompt injection attacks.",
                "timeline": []
            })
        

        if not parsed:
            parsed = {
                "intent": "unknown",
                "entities": [],
                "query": user_query
            }

        print("🔥 PARSED:", parsed)

        # ✅ FIX: Don't drop logs! Use ALL logs for the timeline
        logs = load_logs()
        
        # 🧠 HACKATHON FLEX: Filter logs based on NLP extracted entities (e.g., IP address)
        entities = parsed.get("entities", [])
        target_ip = next((e["value"] for e in entities if e["type"] == "IP_ADDRESS"), None)
        
        if target_ip:
            print(f"🔍 FILTERING LOGS FOR IP: {target_ip}")
            logs = [log for log in logs if log.get("ip") == target_ip]
            
            if not logs:
                return jsonify({
                    "status": "success",
                    "response": f"No malicious activity found for IP {target_ip} in the current dataset.",
                    "timeline": []
                })

        timeline = build_timeline(logs)     # <-- Creates timeline
        attack = detect_attack(timeline)   # <-- 🟢 CREATES THE 'attack' VARIABLE!

        # 🧠 Generate smart explanation using NLP data
        try:
            explanation = generate_explanation(parsed, attack) # <-- Uses it here
        except Exception as e:
            print("EXPLANATION ERROR:", e)
            explanation = f"🛡️ {attack}"
            
        actions = suggest_action(parsed)
        
        # Calculate risk so we can pass it to Node.js
        try:
            risk_score, risk_level = calculate_risk(parsed, timeline)
        except:
            risk_score, risk_level = 75, "High" # Fallback

        # ✅ FIX: Return different data depending on who called the API
        if "/analyze" in request.path:
            # Node.js Server expects this exact format
            return jsonify({
                "risk_score": risk_score,
                "suggestion": ", ".join(actions)
            })
        else:
            # React Frontend expects this format
            return jsonify({
                "status": "success",
                "response": explanation,
                "timeline": timeline,  # ✅ FIX: Sending timeline to React!
                "risk_score": risk_score
            })

    except Exception as e:
        print("❌ SERVER ERROR:", e)
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


if __name__ == "__main__":
    app.run(debug=True, port=5001)