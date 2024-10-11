import unittest
from flask import Flask
from app import app

class FlaskAppTest(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        cls.client = app.test_client()
        cls.client.testing = True

    def test_index(self):
        response = self.client.get('/')
        self.assertEqual(response.status_code, 200)
        self.assertIn(b'<h1>Vending Machine Locator</h1>', response.data)
        self.assertIn(b'<form action="/submit_form" method="post">', response.data)

    def test_submit_form_with_snacks(self):
        response = self.client.post('/submit_form', data={
            'location': 'Test Location',
            'vending_type_snacks': 'snacks'
        }, follow_redirects=True)

        self.assertEqual(response.status_code, 200)
        self.assertIn(b'<h1>Vending Machine Locator</h1>', response.data)

    def test_submit_form_no_radio(self):
        response = self.client.post('/submit_form', data={
            'location': 'Test Location'
        }, follow_redirects=True)

        self.assertEqual(response.status_code, 200)
        self.assertIn(b'<h1>Vending Machine Locator</h1>', response.data)

if (__name__) == '__main__':
    unittest.main()