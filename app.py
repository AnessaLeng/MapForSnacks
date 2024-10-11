from flask import Flask, jsonify, render_template, request, redirect
from flask_cors import CORS
import mysql.connector
from mysql.connector import Error

app = Flask(__name__)
CORS(app)

# MySQL connection configuration
app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_USER'] = 'username'
app.config['MYSQL_PASSWORD'] = 'password'
app.config['MYSQL_DATABASE'] = 'database'

# Sample data for vending machines
vending_machines = [
    {'id': 1, 'location': 'Building 1', 'items': ['Soda', 'Candy', 'Vegan Snacks']},
    {'id': 2, 'location': 'Building 2', 'items': ['Seltzer Drinks', 'Water', 'Snacks']}
]

def get_db_connection():
    try:
        connection = mysql.connector.connect(
            host=app.config['MYSQL_HOST'],
            user=app.config['MYSQL_USER'],
            password=app.config['MYSQL_PASSWORD'],
            database=app.config['MYSQL_DATABASE']
        )
        if connection.is_connected():
            return connection
    except Error as err:
        print(f'Error: {err}')
        return None

# Home page route
@app.route('/home')
def home():
    return "<h1>Welcome to the Vending Machine API!</h1>"

# API endpoint to get all vending machines
@app.route('/api/vending-machines', methods=['GET'])
def get_vending_machines():
    return jsonify(vending_machines)

# API endpoint to filter vending machines by item
@app.route('/api/vending-machines/filter/<item>', methods=['GET'])
def filter_vending_machines(item):
    filtered_lst = [] 
    for vending_machine in vending_machines:
        for i in vending_machine['items']:
            if item.lower() == i.lower():
                filtered_lst.append(vending_machine) 
                break
    return jsonify(filtered_lst)

# Route to render the main index page
@app.get('/')
def index():
    return render_template('index.html')

# Route to handle form submission
@app.post('/submit_form')
def submit_form():
    location = request.form.get('location')
    snacks = request.form.get('vending_type_snacks')
    drinks = request.form.get('vending_type_drinks')
    # Here you might want to process and store the form data as needed
    return redirect('/')

if __name__ == '__main__':
    app.run(debug=True)
