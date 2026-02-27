import unittest
from app import create_app

class TestPlaceEndpoints(unittest.TestCase):

    def setUp(self):
        self.app = create_app()
        self.client = self.app.test_client()

    def _create_user(self, email="alice@example.com"):
        response = self.client.post('/api/v1/users/', json={
            "first_name": "Alice",
            "last_name": "Smith",
            "email": email
        })
        return response.get_json()['id']

    def _create_place(self, owner_id, title="Nice Place"):
        return self.client.post('/api/v1/places/', json={
            "title": title,
            "description": "A nice place",
            "price": 50.0,
            "latitude": 48.8566,
            "longitude": 2.3522,
            "owner_id": owner_id
        })

    # --- POST /api/v1/places/ ---

    def test_create_place(self):
        owner_id = self._create_user()
        response = self._create_place(owner_id)
        self.assertEqual(response.status_code, 201)
        data = response.get_json()
        self.assertIn('id', data)
        self.assertEqual(data['title'], 'Nice Place')
        self.assertEqual(data['owner_id'], owner_id)

    def test_create_place_invalid_data(self):
        response = self.client.post('/api/v1/places/', json={
            "title": "",
            "description": "",
            "price": -10,
            "latitude": 100.0,
            "longitude": 200.0,
            "owner_id": ""
        })
        self.assertEqual(response.status_code, 400)

    def test_create_place_invalid_owner(self):
        response = self._create_place(owner_id="nonexistent-owner-id")
        self.assertEqual(response.status_code, 400)
        self.assertIn('error', response.get_json())

    def test_create_place_invalid_price(self):
        owner_id = self._create_user()
        response = self.client.post('/api/v1/places/', json={
            "title": "Nice Place",
            "description": "A nice place",
            "price": -5.0,
            "latitude": 48.8566,
            "longitude": 2.3522,
            "owner_id": owner_id
        })
        self.assertEqual(response.status_code, 400)

    def test_create_place_invalid_latitude(self):
        owner_id = self._create_user()
        response = self.client.post('/api/v1/places/', json={
            "title": "Nice Place",
            "description": "A nice place",
            "price": 50.0,
            "latitude": 200.0,
            "longitude": 2.3522,
            "owner_id": owner_id
        })
        self.assertEqual(response.status_code, 400)

    def test_create_place_invalid_longitude(self):
        owner_id = self._create_user()
        response = self.client.post('/api/v1/places/', json={
            "title": "Nice Place",
            "description": "A nice place",
            "price": 50.0,
            "latitude": 48.8566,
            "longitude": 200.0,
            "owner_id": owner_id
        })
        self.assertEqual(response.status_code, 400)

    # --- GET /api/v1/places/ ---

    def test_get_all_places_empty(self):
        response = self.client.get('/api/v1/places/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json(), [])

    def test_get_all_places(self):
        owner_id = self._create_user()
        self._create_place(owner_id, "Place A")
        self._create_place(owner_id, "Place B")
        response = self.client.get('/api/v1/places/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.get_json()), 2)

    # --- GET /api/v1/places/<place_id> ---

    def test_get_place(self):
        owner_id = self._create_user()
        created = self._create_place(owner_id)
        place_id = created.get_json()['id']
        response = self.client.get(f'/api/v1/places/{place_id}')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data['id'], place_id)
        self.assertEqual(data['title'], 'Nice Place')

    def test_get_place_not_found(self):
        response = self.client.get('/api/v1/places/nonexistent-id')
        self.assertEqual(response.status_code, 404)

    # --- PUT /api/v1/places/<place_id> ---

    def test_update_place(self):
        owner_id = self._create_user()
        created = self._create_place(owner_id)
        place_id = created.get_json()['id']
        response = self.client.put(f'/api/v1/places/{place_id}', json={
            "title": "Updated Place",
            "description": "Updated description",
            "price": 75.0,
            "latitude": 48.8566,
            "longitude": 2.3522,
            "owner_id": owner_id
        })
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data['title'], 'Updated Place')
        self.assertEqual(data['price'], 75.0)

    def test_update_place_not_found(self):
        response = self.client.put('/api/v1/places/nonexistent-id', json={
            "title": "Updated Place",
            "description": "Updated description",
            "price": 75.0,
            "latitude": 48.8566,
            "longitude": 2.3522,
            "owner_id": "any-id"
        })
        self.assertEqual(response.status_code, 404)
