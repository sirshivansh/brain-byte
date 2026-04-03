from flask import Flask, request, jsonify
from nlp_engine import parse_query
from query_builder import build_query
from timeline import build_timeline, detect_attack
from explanation import generate_explanation, suggest_action
app = Flask(__name__)

@app.route("/ask", methods=["POST"])
def ask():
    try:
        user_query = request.json.get("query")

        # NLP
        parsed = parse_query(user_query)

        # Query builder
        mongo_query = build_query(parsed)

        # Fake logs (replace later with MongoDB)
        logs = [
            {"timestamp": 1, "event_type": "login", "status": "failed"},
            {"timestamp": 2, "event_type": "login", "status": "success"},
            {"timestamp": 3, "event_type": "data_export"}
        ]

        # Timeline
        timeline = build_timeline(logs)

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
            "actions": actions
        })

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        })

if __name__ == "__main__":
    app.run(debug=True)