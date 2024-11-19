from flask import Flask, jsonify
from flask import request
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
    buildings = list(buildings_collection.find({}, {"_id": 0, "building_name": 1, "lat": 1, "lng": 1}))
    return jsonify(buildings)

#
@app.route('/api/filter-machines', methods=['GET'])
def filter_machines():
    building_names = request.args.getlist('buildings')  # Get the list of building names
    machines = list(machine_collection.find({"building_name": {"$in": building_names}}, {"_id": 0}))
    return jsonify(machines)

# Snack data endpoint
@app.route('/api/snacks', methods=['GET'])
def get_snacks():
    snacks = list(snacks_collection.find({}, {"_id": 0}))
    return jsonify(snacks)

# Machine data endpoint
@app.route('/api/vending-machines', methods=['GET'])
def get_vending_machines():
    vending_machines = list(machine_collection.find({}, {"_id": 0}))
    return jsonify(vending_machines)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
