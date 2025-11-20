# app.py

import json
from flask import Flask, jsonify
from flask_cors import CORS
import os

# --- Configuration ---
DATA_FILE = 'MockData/mock_ec2.json'
# The origin of your Next.js frontend, essential for CORS
FRONTEND_ORIGIN = 'http://localhost:3000'

# 1. Load Data Function
def load_mock_data():
    """Reads and loads data from the JSON file based on the EC2 structure."""
    try:
        # Construct the full path to the file
        file_path = os.path.join(os.path.dirname(__file__), DATA_FILE)
        with open(file_path, 'r') as f:
            data = json.load(f)
            print(f"Successfully loaded {len(data)} items from {DATA_FILE}")
            return data
    except FileNotFoundError:
        print(f"Error: {DATA_FILE} not found. Ensure it is in the same directory as app.py.")
        return []
    except json.JSONDecodeError:
        print(f"Error: Could not parse JSON from {DATA_FILE}. Check file integrity and formatting.")
        return []

# Load the data when the script starts
DASHBOARD_DATA = load_mock_data()

# 2. Create the Flask application instance
app = Flask(__name__)

# Configure CORS to allow access from your Next.js frontend
CORS(app, resources={r"/api/*": {"origins": FRONTEND_ORIGIN}})

# 3. Define the API route to serve the EC2 instance data
@app.route('/api/metrics', methods=['GET'])
def get_dashboard_metrics():
    """Serves the loaded EC2 instance data."""
    return jsonify(DASHBOARD_DATA)

# 4. Run the application
if __name__ == '__main__':
    # Flask will run on http://127.0.0.1:5000/
    app.run(host="0.0.0.0", port=5000, debug=True)

