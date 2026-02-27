import unittest
from app import create_app
from app.services import facade

class TestReviewEndpoints(unittest.TestCase):

    def setUp(self):
        self.app = create_app()
        self.client = self.app.test_client()

        facade.user_repo._storage.clear()
        facade.place_repo._storage.clear()
        facade.review_repo._storage.clear()

    def _create_user(self, email="review.user@example.com"):
        response = self.client.post('/api/v1/users/', json={
            "first_name": "Review",
            "last_name": "User",
            "email": email
        })
        return response.get_json()['id']

    def _create_place(self, owner_id):
        response = self.client.post('/api/v1/places/', json={
            "title": "Nice Place",
            "description": "A nice place",
            "price": 50.0,
            "latitude": 48.8566,
            "longitude": 2.3522,
            "owner_id": owner_id
        })
        return response.get_json()['id']

    def _create_review(self, user_id, place_id, text="Great place!", rating=5):
        return self.client.post('/api/v1/reviews/', json={
            "user_id": user_id,
            "place_id": place_id,
            "text": text,
            "rating": rating
        })

    # --- POST /api/v1/reviews/ ---

    def test_create_review(self):
        user_id = self._create_user()
        place_id = self._create_place(user_id)
        response = self._create_review(user_id, place_id)
        self.assertEqual(response.status_code, 201)
        data = response.get_json()
        self.assertIn('id', data)
        self.assertEqual(data['text'], 'Great place!')
        self.assertEqual(data['rating'], 5)
        self.assertEqual(data['user_id'], user_id)
        self.assertEqual(data['place_id'], place_id)

    def test_create_review_invalid_data(self):
        response = self.client.post('/api/v1/reviews/', json={
            "user_id": "",
            "place_id": "",
            "text": ""
        })
        self.assertEqual(response.status_code, 400)
        self.assertIn('error', response.get_json())

    def test_create_review_invalid_rating(self):
        user_id = self._create_user()
        place_id = self._create_place(user_id)
        response = self._create_review(user_id, place_id, rating=6)
        self.assertEqual(response.status_code, 400)
        self.assertIn('error', response.get_json())

    def test_create_review_invalid_user_or_place(self):
        response = self._create_review(
            user_id="nonexistent-user",
            place_id="nonexistent-place"
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn('error', response.get_json())

    # --- GET /api/v1/reviews/ ---

    def test_get_reviews(self):
        user_id = self._create_user()
        place_id = self._create_place(user_id)
        self._create_review(user_id, place_id, text="Review A")
        self._create_review(user_id, place_id, text="Review B", rating=4)

        response = self.client.get('/api/v1/reviews/')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(len(data), 2)

    def test_get_reviews_empty(self):
        response = self.client.get('/api/v1/reviews/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json(), [])

    # --- GET /api/v1/reviews/<review_id> ---

    def test_get_review_by_id(self):
        user_id = self._create_user()
        place_id = self._create_place(user_id)
        created = self._create_review(user_id, place_id)
        review_id = created.get_json()['id']

        response = self.client.get(f'/api/v1/reviews/{review_id}')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data['id'], review_id)
        self.assertEqual(data['text'], 'Great place!')

    def test_get_review_by_id_not_found(self):
        response = self.client.get('/api/v1/reviews/nonexistent_id')
        self.assertEqual(response.status_code, 404)
        self.assertIn('error', response.get_json())

    # --- PUT /api/v1/reviews/<review_id> ---

    def test_put_review(self):
        user_id = self._create_user()
        place_id = self._create_place(user_id)
        created = self._create_review(user_id, place_id)
        review_id = created.get_json()['id']

        response = self.client.put(f'/api/v1/reviews/{review_id}', json={
            "text": "Updated review text",
            "rating": 4
        })
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data['id'], review_id)
        self.assertEqual(data['text'], 'Updated review text')
        self.assertEqual(data['rating'], 4)

    def test_put_review_not_found(self):
        response = self.client.put('/api/v1/reviews/nonexistent-id', json={
            "text": "Updated review text",
            "rating": 4
        })
        self.assertEqual(response.status_code, 404)
        self.assertIn('error', response.get_json())

    # --- DELETE /api/v1/reviews/<review_id> ---

    def test_delete_review(self):
        user_id = self._create_user()
        place_id = self._create_place(user_id)
        created = self._create_review(user_id, place_id)
        review_id = created.get_json()['id']

        delete_response = self.client.delete(f'/api/v1/reviews/{review_id}')
        self.assertEqual(delete_response.status_code, 200)
        self.assertIn('message', delete_response.get_json())

        get_response = self.client.get(f'/api/v1/reviews/{review_id}')
        self.assertEqual(get_response.status_code, 404)

    def test_delete_review_not_found(self):
        response = self.client.delete('/api/v1/reviews/nonexistent-id')
        self.assertEqual(response.status_code, 404)
        self.assertIn('error', response.get_json())