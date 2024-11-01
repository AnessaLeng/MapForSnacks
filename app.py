from flask import Flask, jsonify, render_template, request, redirect
from flask_cors import CORS
from google.oauth2 import id_token
from google.auth.transport import requests
import mysql.connector
from mysql.connector import Error
from dotenv import load_dotenv
import os

app = Flask(__name__)
CORS(app)

load_dotenv()

CLIENT_ID = os.getenv('CLIENT_ID') #GOOGLE CLIENT ID

# MySQL connection configuration
app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_USER'] = os.getenv('MYSQL_USER')
app.config['MYSQL_PASSWORD'] = os.getenv('MYSQL_PASSWORD')
app.config['MYSQL_DATABASE'] = 'mapforsnacks'

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
    
@app.route('/api/auth/google', methods=['POST'])
def google_auth():
    token = request.json.get('token')
    try:
        idinfo = id_token.verify_oauth2_token(token, requests.Request(), CLIENT_ID)
        google_id = idinfo['sub']
        email = idinfo['email']

        # Connect to the MySQL database
        conn = get_db_connection()
        if conn is None:
            return jsonify({'success': False, 'error': 'Database connection failed'}), 500
        cursor = conn.cursor()

        # Check if user already exists
        cursor.execute("SELECT * FROM users WHERE google_id = %s", (google_id,))
        user = cursor.fetchone()

        if user is None:
            # Insert new user if not exists
            cursor.execute("INSERT INTO users (google_id, email) VALUES (%s, %s)", (google_id, email))
            conn.commit()

        cursor.close()
        conn.close()

        return jsonify({'success': True, 'google_id': google_id, 'email': email})

    except ValueError:
        return jsonify({'success': False, 'error': 'Invalid token'}), 400
    except Error as e:
        return jsonify({'success': False, 'error': str(e)}), 500
    
# Sample data for vending machines
vending_machines = [
    {'id': 1, 'location': 'Building 1', 'items': ['Soda', 'Candy', 'Vegan Snacks']},
    {'id': 2, 'location': 'Building 2', 'items': ['Seltzer Drinks', 'Water', 'Snacks']}
]

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

@app.route('/api/user-info', methods=['GET'])
def get_user_info():
    google_id = request.args.get('google_id')

@app.route('/api/search-history', methods=['GET'])
def get_search_history():
    google_id = request.args.get('google_id')

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
