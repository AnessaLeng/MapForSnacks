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

try:
    client.server_info()  # This will throw an error if the server is unreachable
    print("Connected to MongoDB successfully!")
except Exception as e:
    print("Failed to connect to MongoDB:", e)

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
        
@app.route('/api/user/data', methods=['GET'])
@jwt_required()
def get_user_data(current_user):
    return jsonify({
        'searchHistory': current_user['search_history'],
        'favorites': current_user['favorites']
    })

@app.route('/search_history', methods=['POST'])
@jwt_required()
def log_search_history():
    current_user_email = get_jwt_identity()
    data = request.get_json()

    user = db.users.find_one({'email': current_user_email})
    if not user:
        return jsonify({'msg': 'User not found'}), 404

    timestamp = datetime.now()

    history_entry = {
        'user_id': user['_id'],
        'vending_id': data.get('vending_id'),
        'snack_id': data.get('snack_id'),
        'building_name': data.get('building_name'),
        'from': data.get('from'),
        'to': data.get('to'),
        'timestamp': timestamp,
    }

    db.history.insert_one(history_entry)
    return jsonify({'message': 'Search history saved!'}), 200

@app.route('/search_history', methods=['GET'])
@jwt_required()
def get_search_history():
    current_user_email = get_jwt_identity()

    user = db.users.find_one({'email': current_user_email})
    if not user:
        return jsonify({'msg': 'User not found'}), 404

    search_history = list(search_history_collection.find({"user_id": user['_id']}))

    if not search_history:
        return jsonify({'msg': 'No history found'}), 404

    for entry in search_history:
        entry['_id'] = str(entry['_id'])
        entry['from_location'] = entry.get('from', 'N/A')
        entry['to_location'] = entry.get('to', 'N/A')
        entry['filtered_search'] = entry.get('building_name', 'N/A')
    return jsonify(search_history)

@app.route('/api/user/favorites', methods=['POST'])
@jwt_required()
def add_favorite():
    # Extract data from the request
    current_user_email = get_jwt_identity()
    data = request.get_json()
    machine = data.get('machine')

    if not machine:
        return jsonify({'msg': 'No machine data provided'}), 400
    
    user = db.users.find_one({'email': current_user_email})
    if not user:
        return jsonify({'msg': 'User not found'}), 404

    if 'favorites' not in user:
        user['favorites'] = []
    
    if machine not in user.get('favorites', []):
        # Add the machine to the favorites list
        user['favorites'].append(machine)

        db.users.update_one({'_id': user['_id']}, {'$set': {'favorites': user['favorites']}})
        return jsonify({'msg': 'Machine added to favorites', 'favorites': user['favorites']}), 200
    else:
        return jsonify({'msg': 'Machine is already in favorites', 'favorites': user['favorites']}), 400

@app.route('/favorites', methods=['GET'])
@jwt_required()
def get_favorites():
    current_user_email = get_jwt_identity()

    user = db.users.find_one({'email': current_user_email})
    if not user:
        return jsonify({'msg': 'User not found'}), 404
    
    # Return the 'favorites' array from the user document
    return jsonify(user.get('favorites', []))

@app.route('/favorites/<favorite_id>', methods=['DELETE'])
@jwt_required()
def delete_favorite(favorite_id):
    current_user_email = get_jwt_identity()

    user = db.users.find_one({'email': current_user_email})
    if not user:
        return jsonify({'msg': 'User not found'}), 404
    
    db.users.update_one(
        {'email': current_user_email},
        {"$pull": {"favorites": {"_id": ObjectId(favorite_id)}}}
    )
    return jsonify({"message": "Favorite deleted successfully!"}), 200

@app.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    return jsonify(msg="Successfully logged out"), 200

if __name__ == '__main__':
    app.run(debug=True)