import unittest
from app import app
from database import app

class TestDatabaseAPI(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        cls.client = app.test_client() 
        cls.client.testing = True
        # app.config['SERVER_NAME'] = "127.0.0.1:5000"

    def test_get_buildings(self):
        response = self.client.get('/api/buildings')
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.json, list)
        if response.json:
            self.assertIn('building_id', response.json[0])
            self.assertIn('building_name', response.json[0])

    def test_get_snacks(self):
        response = self.client.get('/api/snacks')
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.json, list)
        if response.json:
            self.assertIn('snack_id', response.json[0])
            self.assertIn('snack_name', response.json[0])
            self.assertIn('category', response.json[0])
            self.assertIn('price', response.json[0])

    def test_get_machine(self):
        response = self.client.get('/api/machine')
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.json, list)
        if response.json:
            self.assertIn('vending_id', response.json[0])
            self.assertIn('snack_id', response.json[0])
            self.assertIn('quantity', response.json[0])
            self.assertIn('stock_status', response.json[0])
    
    def test_invalid_endpoint(self):
        response = self.client.get('/api/nonexistent')
        self.assertEqual(response.status_code, 404)
    

if __name__ == '__main__':
    unittest.main()