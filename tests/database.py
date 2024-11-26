from flask import Flask, jsonify, request
from flask_cors import CORS
from pymongo import MongoClient

app = Flask(__name__)
CORS(app)

# MongoDB connection
client = MongoClient('mongodb+srv://sscott81:8db$00Ss@cluster0.m0ivf.mongodb.net/vending?retryWrites=true&w=majority&appName=Cluster0')
db = client.vending  # name of database
buildings_collection = db["buildings"]
snacks_collection = db["snacks"]
machine_collection = db["machine"]

# Building data endpoint
@app.route('/api/buildings', methods=['GET'])
def get_buildings():
    buildings = list(buildings_collection.find({}, {
        "_id": 0,
        "building_name": 1,
        "lat": 1,
        "lng": 1,
        "Offering": 1,
        "floor": 1,
        "vending_id": 1
    }))
    return jsonify(buildings)

# Machine data endpoint (updated to use vending_id)
@app.route('/api/vending-machines', methods=['GET'])
def get_vending_machines():
    vending_machines = list(machine_collection.find({}, {"_id": 0}))
    return jsonify(vending_machines)

# Snack data endpoint
@app.route('/api/snacks', methods=['GET'])
def get_snacks():
    snacks = list(snacks_collection.find({}, {"_id": 0}))
    return jsonify(snacks)

if __name__ == '__main__':
    app.run(debug=True, port=5000)