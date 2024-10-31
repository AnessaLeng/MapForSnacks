from flask import Flask, jsonify
from flask_cors import CORS
from pymongo import MongoClient

app = Flask(__name__)
CORS(app)

# MongoDB connection
#this url will be linked to an online MongoDbAtlas database
client = MongoClient('mongodb+srv://sscott81:8db$00Ss@cluster0.m0ivf.mongodb.net/vending?retryWrites=true&w=majority&appName=Cluster0')
db = client.vending #name of database
buildings_collection = db["buildings"]
snacks_collection = db["snacks"]
machine_collection = db["machine"]

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

if __name__ == '__main__':
    app.run(debug=True, port=5000)




