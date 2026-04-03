from flask import Flask, request, jsonify
from nlp_engine import parse_query
from query_builder import build_query
from timeline import build_timeline, detect_attack
from explanation import generate_explanation, suggest_action
from data_loader import load_logs
from timeline import correlate_logs
from explanation import calculate_risk
from timeline import detect_suspicious_ip
app = Flask(__name__)

@app.route("/ask", methods=["POST"])
def ask():
    try:
        user_query = request.json.get("query")

        # NLP
        parsed = parse_query(user_query)

        # Query builder
        mongo_query = build_query(parsed)

       # Load real logs
        logs = load_logs()

    # Correlate logs (group by IP/User)
        grouped_logs = correlate_logs(logs)

    # Take first attack scenario
        logs = list(grouped_logs.values())[0]

        suspicious_ip = detect_suspicious_ip(logs)

        # Timeline
        timeline = build_timeline(logs)
        risk_score, risk_level = calculate_risk(parsed, timeline)

        # Attack detection
        attack = detect_attack(timeline)

        # AI explanation
        explanation = generate_explanation(parsed)

        # Suggested actions
        actions = suggest_action(parsed)

        return jsonify({
    "status": "success",
    "user_query": user_query,
    "parsed": parsed,
    "mongo_query": str(mongo_query),
    "timeline": timeline,
    "attack_analysis": attack,
    "explanation": explanation,
    "actions": actions,
    "risk_score": risk_score,
    "suspicious_ip": suspicious_ip,
    "risk_level": risk_level
})

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        })

if __name__ == "__main__":
    app.run(debug=True)