import mysql.connector
from mysql.connector import Error

def test_connection():
    try:
        connection = mysql.connector.connect(
            host='localhost',
            user='username',
            password='password',
            database='database'
        )
        if connection.is_connected():
            print('Connected to MySQL database.')
            cursor = connection.cursor()
            cursor.execute("SELECT DATABASE();")
            db = cursor.fetchone()
            print(f'Connected to database: {db}')
    except Error as err:
        print(f'Error: {err}')
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

if __name__ == '__main__':
    test_connection()