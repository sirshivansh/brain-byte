from flask import Flask, request, jsonify
from nlp_engine import parse_query
from query_builder import build_query

app = Flask(__name__)

@app.route("/ask", methods=["POST"])
def ask():
    try:
        user_query = request.json.get("query")

        # NLP
        parsed = parse_query(user_query)

        # Build Mongo Query
        mongo_query = build_query(parsed)

        return jsonify({
            "status": "success",
            "user_query": user_query,
            "parsed": parsed,
            "mongo_query": str(mongo_query)  # convert datetime to string
        })

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        })

if __name__ == "__main__":
    app.run(debug=True)