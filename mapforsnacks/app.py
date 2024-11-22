from flask import Flask, jsonify, request
from flask_cors import CORS
from google.oauth2 import id_token
from google.auth.transport import requests
from pymongo import MongoClient
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, get_jwt_identity, jwt_required
from datetime import datetime
from bson import ObjectId

app = Flask(__name__)
CORS(app)

app.config["JWT_SECRET_KEY"] = "SECRET_KEY"

jwt = JWTManager(app)
bcrypt = Bcrypt(app)

# MongoDB connection
#this url will be linked to an online MongoDbAtlas database
client = MongoClient('mongodb+srv://sscott81:8db$00Ss@cluster0.m0ivf.mongodb.net/vending?retryWrites=true&w=majority&appName=Cluster0')
db = client.vending #name of database
buildings_collection = db["buildings"]
snacks_collection = db["snacks"]
machine_collection = db["machine"]
users_collection = db["users"]
search_history_collection = db["history"]
favorites_collection = db["favorites"]

# Building data endpoint
@app.route('/api/buildings', methods=['GET'])
def get_buildings():
    buildings = list(buildings_collection.find({}, {"_id": 0}))
    return jsonify(buildings)

# Snack data endpoint
@app.route('/api/snacks', methods=['GET'])
def get_snacks():
    snacks = list(snacks_collection.find({}, {"_id": 0}))
    return jsonify(snacks)

# Machine data endpoint
@app.route('/api/machine', methods=['GET'])
def get_machine():
    machine_data = list(machine_collection.find({}, {"_id": 0}))
    return jsonify(machine_data)


@app.route('/signup', methods=['POST'])
def signup():
    try:
        data = request.get_json()

        if not data or "first_name" not in data or "last_name" not in data:
            return jsonify({"msg": "Missing name!"}), 400

        if not data or "email" not in data or "password" not in data:
            return jsonify({"msg": "Missing email or password!"}), 400

        # Check if the user exists already
        existing_user = users_collection.find_one({"email": data["email"]})
        if existing_user:
            return jsonify({"msg": "User already exists!"}), 400

        # Hash the password
        hashed_password = bcrypt.generate_password_hash(data["password"]).decode('utf-8')
        
        # Insert the new user into the database
        new_user = {
            "first_name": data["first_name"],
            "last_name": data["last_name"],
            "email": data["email"],
            "password": hashed_password
        }
        users_collection.insert_one(new_user)
        return jsonify({"msg": "User registered successfully!"}), 201
    except Exception as e:
        return jsonify({"msg": f"Error: {str(e)}"}), 500

# Route for User Login
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    # Check if the user exists
    user = users_collection.find_one({"email": data["email"]})
    if not user:
        return jsonify({"msg": "User not found!"}), 404
    
    # Check if the password is correct
    if bcrypt.check_password_hash(user["password"], data["password"]):
        # Generate JWT token
        access_token = create_access_token(identity=user["email"])
        return jsonify({"msg": "Login successful!", "access_token": access_token}), 200
    else:
        return jsonify({"msg": "Incorrect password!"}), 400

@app.route('/api/auth/google-login', methods=['POST'])
def google_login():
    token = request.json.get('idToken')
    
    try:
        idinfo = id_token.verify_oauth2_token(token, requests.Request(), '988046540404-rvnhbcvmi6ksqda0vgnj5gv0g8goebs2.apps.googleusercontent.com')
        # If the token is valid, create or update the user in your database here
        first_name = idinfo.get('given_name', 'N/A')
        last_name = idinfo.get('family_name', 'N/A')
        email = idinfo.get('email', 'N/A')

        user = users_collection.find_one({"email": email})
        if not user:
            new_user = {
                "first_name": first_name,
                "last_name": last_name,
                "email": email,
                "password": None  # Password will be empty for Google users
            }
            users_collection.insert_one(new_user)
        access_token = create_access_token(identity=email)
        return jsonify({"msg": "User authenticated via Google", "access_token": access_token}), 200
    except ValueError as e:
        return jsonify({"error": "Invalid token: " + e}), 401
    
@app.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    # Get the identity/email of the current user from the JWT token
    current_user = get_jwt_identity()
    user = users_collection.find_one({"email": current_user})
    if user:
        user_data = {
            "first_name": user["first_name"],
            "last_name": user["last_name"],
            "email": user["email"]
        }
        return jsonify(user_data), 200
    else:
        try:
            # Decode the JWT token to extract the user's info (if Google login)
            token = request.headers.get('Authorization').split(' ')[1]  # Extract the token from Authorization header
            decoded_token = jwt.decode(token, options={"verify_signature": False})

            # Check if the decoded token contains Google login data
            first_name = decoded_token.get("given_name", "N/A")
            last_name = decoded_token.get("family_name", "N/A")
            email = decoded_token.get("email", "N/A")

            user_data = {
                "first_name": first_name,
                "last_name": last_name,
                "email": email
            }
            return jsonify(user_data), 200
        except Exception as e:
            return jsonify({"msg": "User not found"}), 404

@app.route('/search-history', methods=['POST'])
@jwt_required()
def log_search_history():
    data = request.get_json()

    user_id = get_jwt_identity()
    vending_id = data.get('vending_id')
    snack_id = data.get('snack_id')
    timestamp = data.get('timestamp', datetime().isoformat())

    if not vending_id:
        return jsonify({"message": "vending_id is required"}), 400
    
    search_entry = {
        "user_id": user_id,
        "vending_id": vending_id,
        "snack_id": snack_id,
        "timestamp": timestamp
    }
    search_history_collection.insert_one(search_entry)
    return jsonify({"message": "Search history saved successfully"}), 201

@app.route('/search-history', methods=['GET'])
@jwt_required()
def get_search_history():
    user_id = get_jwt_identity()

    search_history = list(search_history_collection.find({"user_id": user_id}))

    for entry in search_history:
        entry['_id'] = str(entry['_id'])
    return jsonify(search_history)

@app.route('/add_to_favorites', methods=['POST'])
@jwt_required()
def add_to_favorites():
    # Extract data from the request
    data = request.get_json()
    lat = data.get('lat')
    lng = data.get('lng')
    building_name = data.get('building_name')
    user_id = get_jwt_identity()
    
    favorite = {
        'user_id': user_id,
        'lat': lat,
        'lng': lng,
        'building_name': building_name
    }

    favorites_collection.insert_one(favorite)
    return jsonify({'message': 'Machine location added to favorites!'})

@app.route('/get_favorites', methods=['GET'])
@jwt_required()
def get_favorites():
    user_id = get_jwt_identity()
    favorites = list(favorites_collection.find({"user_id": user_id}))

    for favorite in favorites:
        favorite['_id'] = str(favorite['_id']) 
    return jsonify(favorites)

@app.route('/delete_favorite/<favorite_id>', methods=['DELETE'])
@jwt_required()
def delete_favorite(favorite_id):
    user_id = get_jwt_identity()

    favorite = favorites_collection.find_one({"_id": ObjectId(favorite_id), "user_id": user_id})
    
    if not favorite:
        return jsonify({"message": "Favorite not found or you're not authorized to delete it"}), 404
    
    favorites_collection.delete_one({"_id": ObjectId(favorite_id), "user_id": user_id})
    return jsonify({"message": "Favorite deleted successfully!"}), 200

@app.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    return jsonify(msg="Successfully logged out"), 200

if __name__ == '__main__':
    app.run(debug=True)