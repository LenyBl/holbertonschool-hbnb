import unittest
from app import create_app

class TestAmenityEndpoints(unittest.TestCase):

    def setUp(self):
        self.app = create_app()
        self.client = self.app.test_client()

    def _create_amenity(self, name="Wi-Fi"):
        return self.client.post('/api/v1/amenities/', json={"name": name})

    # --- POST /api/v1/amenities/ ---

    def test_create_amenity(self):
        response = self._create_amenity()
        self.assertEqual(response.status_code, 201)
        data = response.get_json()
        self.assertIn('id', data)
        self.assertEqual(data['name'], 'Wi-Fi')

    def test_create_amenity_invalid_data(self):
        response = self._create_amenity(name="")
        self.assertEqual(response.status_code, 400)
        self.assertIn('error', response.get_json())

    # --- GET /api/v1/amenities/ ---

    def test_get_all_amenities_empty(self):
        response = self.client.get('/api/v1/amenities/')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIn('amenities', data)
        self.assertEqual(data['amenities'], [])

    def test_get_all_amenities(self):
        self._create_amenity("Wi-Fi")
        self._create_amenity("Pool")
        response = self.client.get('/api/v1/amenities/')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(len(data['amenities']), 2)

    # --- GET /api/v1/amenities/<amenity_id> ---

    def test_get_amenity(self):
        created = self._create_amenity()
        amenity_id = created.get_json()['id']
        response = self.client.get(f'/api/v1/amenities/{amenity_id}')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data['id'], amenity_id)
        self.assertEqual(data['name'], 'Wi-Fi')

    def test_get_amenity_not_found(self):
        response = self.client.get('/api/v1/amenities/nonexistent-id')
        self.assertEqual(response.status_code, 404)
        self.assertIn('error', response.get_json())

    # --- PUT /api/v1/amenities/<amenity_id> ---

    def test_update_amenity(self):
        created = self._create_amenity()
        amenity_id = created.get_json()['id']
        response = self.client.put(f'/api/v1/amenities/{amenity_id}', json={"name": "Parking"})
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data['name'], 'Parking')

    def test_update_amenity_not_found(self):
        response = self.client.put('/api/v1/amenities/nonexistent-id', json={"name": "Parking"})
        self.assertEqual(response.status_code, 404)
        self.assertIn('error', response.get_json())
