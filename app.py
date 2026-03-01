from flask import Flask, render_template, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# ROUTE FOR FRONTEND
@app.route("/")
def home():
    return render_template("index.html")

# PREDICT ROUTE
@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json()

        if not data:
            return jsonify({"error": "No data received"}), 400

        income = float(data.get("income", 0))
        land = float(data.get("landSize", 0))

        credit_score = min(100, int((income / 10000) + (land * 2)))
        eligible_loan = int(income * 2)

        return jsonify({
            "credit_score": credit_score,
            "eligible_loan": eligible_loan
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

import os

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)

