import unittest
from app import create_app

class TestUserEndpoints(unittest.TestCase):

    def setUp(self):
        self.app = create_app()
        self.client = self.app.test_client()

    def _create_user(self, email="jane.doe@example.com"):
        return self.client.post('/api/v1/users/', json={
            "first_name": "Jane",
            "last_name": "Doe",
            "email": email
        })

    # --- POST /api/v1/users/ ---

    def test_create_user(self):
        response = self._create_user()
        self.assertEqual(response.status_code, 201)
        data = response.get_json()
        self.assertIn('id', data)
        self.assertEqual(data['first_name'], 'Jane')
        self.assertEqual(data['last_name'], 'Doe')
        self.assertEqual(data['email'], 'jane.doe@example.com')

    def test_create_user_invalid_data(self):
        response = self.client.post('/api/v1/users/', json={
            "first_name": "",
            "last_name": "",
            "email": "invalid-email"
        })
        self.assertEqual(response.status_code, 400)

    def test_create_user_duplicate_email(self):
        self._create_user()
        response = self._create_user()
        self.assertEqual(response.status_code, 400)
        self.assertIn('error', response.get_json())

    def test_create_user_empty_first_name(self):
        response = self.client.post('/api/v1/users/', json={
            "first_name": "",
            "last_name": "Doe",
            "email": "test@example.com"
        })
        self.assertEqual(response.status_code, 400)

    def test_create_user_empty_last_name(self):
        response = self.client.post('/api/v1/users/', json={
            "first_name": "Jane",
            "last_name": "",
            "email": "test@example.com"
        })
        self.assertEqual(response.status_code, 400)

    # --- GET /api/v1/users/<user_id> ---

    def test_get_user(self):
        created = self._create_user()
        user_id = created.get_json()['id']
        response = self.client.get(f'/api/v1/users/{user_id}')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data['id'], user_id)
        self.assertEqual(data['email'], 'jane.doe@example.com')

    def test_get_user_not_found(self):
        response = self.client.get('/api/v1/users/nonexistent-id')
        self.assertEqual(response.status_code, 404)
        self.assertIn('error', response.get_json())
