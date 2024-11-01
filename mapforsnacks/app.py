from flask import Flask, jsonify, request
from flask_cors import CORS
from google.oauth2 import id_token
from google.auth.transport import requests

app = Flask(__name__)
CORS(app)

@app.route('/api/signup', methods=['POST'])
def signup():
    data = request.json
    return jsonify({"message": "User created successfully"}), 201

@app.route('/api/auth/google-login', methods=['POST'])
def google_login():
    token = request.json.get('idToken')
    
    try:
        # Specify the CLIENT_ID of the app that accesses the backend:
        idinfo = id_token.verify_oauth2_token(token, requests.Request(), '988046540404-rvnhbcvmi6ksqda0vgnj5gv0g8goebs2.apps.googleusercontent.com')
        # If the token is valid, create or update the user in your database here
        user_email = idinfo['email']
        return jsonify({"message": "User authenticated", "email": user_email}), 200
    except ValueError as e:
        return jsonify({"error": "Invalid token"}), 401

if __name__ == '__main__':
    app.run(debug=True)