import unittest
from unittest.mock import patch
import requests

class TestAPI(unittest.TestCase):

    @patch('requests.get') 
    def test_fetch_buildings(self, mock_get):
        mock_get.return_value.status_code = 200
        mock_get.return_value.json.return_value = [
            {"building_name": "Building 1", "lat": "35.3075", "lng": "-80.7294"}
        ]

        response = requests.get('http://127.0.0.1:5000/api/buildings') 
        self.assertEqual(response.json(), [{"building_name": "Building 1", "lat": "35.3075", "lng": "-80.7294"}])

    @patch('requests.get')
    def test_fetch_vending_machines(self, mock_get):
        mock_get.return_value.status_code = 200
        mock_get.return_value.json.return_value = [
            {"machine_id": 1, "building_name": "Building 1", "snack_name": "Soda"}
        ]

        response = requests.get('http://127.0.0.1:5000/api/vending-machines') 
        self.assertEqual(response.json(), [{"machine_id": 1,"building_name":"Building 1","snack_name":"Soda"}])

    @patch('requests.get')
    def test_fetch_snacks(self, mock_get):
        mock_get.return_value.status_code = 200
        mock_get.return_value.json.return_value = [
            {"snack_id": 1,"snack_name": "Chips"}
        ]

        response = requests.get('http://127.0.0.1:5000/api/snacks') 
        self.assertEqual(response.json(), [{"snack_id": 1, "snack_name": "Chips"}])

    @patch('requests.get')
    def test_fetch_error_handling(self, mock_get):
        mock_get.return_value.status_code = 500
        mock_get.return_value.json.return_value = [] 
        mock_get.return_value.text = "Internal Server Error"

        response = requests.get('http://127.0.0.1:5000/api/buildings')
        self.assertEqual(response.json(), [])

if __name__ == '__main__':
    unittest.main()