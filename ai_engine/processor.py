from flask import Flask, request, jsonify
from flask_cors import CORS
import spacy

app = Flask(__name__)
CORS(app)
nlp = spacy.load("en_core_web_sm")

@app.route('/analyze', methods=['POST'])
def analyze():
    data = request.json
    text = data.get('text', '')
    # This is where the NL Query logic goes
    return jsonify({"status": "success", "analysis": "AI is online"})

if __name__ == '__main__':
    app.run(port=5001)