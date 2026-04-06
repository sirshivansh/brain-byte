from flask import Flask, request, jsonify
from flask_cors import CORS

from nlp_engine import parse_query
from timeline import build_timeline, detect_attack
from explanation import (
    generate_explanation,
    suggest_action,
    calculate_risk
)
from live_data_generator import get_live_logs

app = Flask(__name__)
CORS(app)

@app.route("/ask", methods=["POST"])
@app.route("/analyze", methods=["POST"])
def process_query():
    try:
        data = request.get_json()
        
        # ✅ Support both React ('message') and Node ('text') keys
        user_query = data.get("message") or data.get("text") if data else None
        
        # ✅ Capture the history context from the Node.js server
        history = data.get("history_context", "")

        print("🔥 USER QUERY:", user_query)

        if not user_query:
            return jsonify({"status": "error", "message": "No query"}), 400

        # 1. Parse the query first
        parsed = parse_query(user_query)
        
        # 🛑 AI SAFETY NET
        if parsed.get("intent") in ["injection_attempt", "out_of_domain"]:
            return jsonify({
                "status": "success",
                "response": "🛑 Security Policy: Restricted to security log analysis.",
                "timeline": []
            })

        # 2. 🛡️ THE FIX: Define target_ip FIRST from the parsed results
        entities = parsed.get("entities", [])
        target_ip = next((e["value"] for e in entities if e["type"] == "IP_ADDRESS"), None)

        print(f"🔍 TARGET IP IDENTIFIED: {target_ip}")

        # 3. 🧠 NOW generate live data safely using that specific IP
        logs = get_live_logs(count=8, target_ip=target_ip)
        
        timeline = build_timeline(logs)
        attack = detect_attack(timeline)

        # 4. Generate the explanation
        try:
            explanation = generate_explanation(parsed, attack, timeline)
            # Combine the database history with the AI explanation
            if history:
                explanation = f"{history}\n\n{explanation}"
        except Exception as e:
            print("❌ EXPLANATION ERROR:", e)
            explanation = f"🛡️ {attack}"
            
        actions = suggest_action(parsed)
        
        # 5. Calculate risk
        try:
            risk_score, risk_level = calculate_risk(parsed, timeline)
        except:
            risk_score, risk_level = 75, "High"

        # ✅ Return the correct format depending on which server called this
        if "/analyze" in request.path:
            return jsonify({
                "risk_score": risk_score,
                "suggestion": ", ".join(actions)
            })
        else:
            return jsonify({
                "status": "success",
                "response": explanation,
                "timeline": timeline,  
                "risk_score": risk_score
            })

    except Exception as e:
        print("❌ SERVER ERROR:", e)
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

if __name__ == "__main__":
    # Ensure it runs on Port 5001 to match your Node.js and React settings
    app.run(debug=True, port=5001)