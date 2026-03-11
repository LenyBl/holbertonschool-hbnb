from flask_restx import Namespace, Resource, fields
from app.services import facade
from flask_jwt_extended import jwt_required, get_jwt_identity

api = Namespace('reviews', description='Review operations')

# Define the review model for input validation and documentation
review_model = api.model('Review', {
    'text': fields.String(required=True, description='Text of the review'),
    'rating': fields.Integer(required=True, description='Rating of the place (1-5)'),
    'user_id': fields.String(required=True, description='ID of the user'),
    'place_id': fields.String(required=True, description='ID of the place')
})


@api.route('/')
class ReviewList(Resource):
    @api.expect(review_model)
    @api.response(201, 'Review successfully created')
    @api.response(400, 'Invalid input data')
    @jwt_required()
    def post(self):
        current_user = get_jwt_identity()  # Get the current user's ID from the JWT token
        """Register a new review"""
        try:
            review_data = api.payload
            if review_data['user_id'] != current_user:
                return {'error': 'You can only create reviews for yourself'}, 403
            get_place_user = facade.get_place(review_data['place_id']).owner.id
            if get_place_user == current_user:
                return {'error': 'You cannot review your own place'}, 400
            get_review_place_user = facade.get_reviews_by_place(review_data['place_id'])
            for review in get_review_place_user:
                if review.user.id == current_user:
                    return {'error': 'You have already reviewed this place'}, 400
            try:
                new_review = facade.create_review(review_data)
            except ValueError as e:
                return {'error': str(e)}, 400
            return {
                'id': new_review.id,
                'text': new_review.text,
                'rating': new_review.rating,
                'user_id': new_review.user.id,
                'place_id': new_review.place.id
            }, 201
        except ValueError as e:
            return {'error': str(e)}, 400

    @api.response(200, 'List of reviews retrieved successfully')
    def get(self):
        """Retrieve a list of all reviews"""
        reviews = facade.get_all_reviews()
        return [{
            'id': review.id,
            'text': review.text,
            'rating': review.rating,
            'user_id': review.user.id,
            'place_id': review.place.id
        } for review in reviews], 200


@api.route('/<review_id>')
class ReviewResource(Resource):
    @api.response(200, 'Review details retrieved successfully')
    @api.response(404, 'Review not found')
    def get(self, review_id):
        """Get review details by ID"""
        try:
            review = facade.get_review(review_id)
            return {
                'id': review.id,
                'text': review.text,
                'rating': review.rating,
                'user_id': review.user.id,
                'place_id': review.place.id
            }, 200
        except ValueError:
            return {'error': 'Review not found'}, 404

    @api.expect(review_model)
    @api.response(200, 'Review updated successfully')
    @api.response(403, 'Unauthorized action')
    @api.response(404, 'Review not found')
    @api.response(400, 'Invalid input data')
    @jwt_required()
    def put(self, review_id):
        """Update a review's information"""
        current_user = get_jwt_identity()
        try:
            existing_review = facade.get_review(review_id)
        except ValueError:
            return {'error': 'Review not found'}, 404
        if existing_review.user.id != current_user:
            return {'error': 'Unauthorized action'}, 403
        review_data = api.payload
        try:
            updated_review = facade.update_review(review_id, review_data)
            return {
                'id': updated_review.id,
                'text': updated_review.text,
                'rating': updated_review.rating,
                'user_id': updated_review.user.id,
                'place_id': updated_review.place.id
            }, 200
        except ValueError as e:
            return {'error': str(e)}, 400

    @api.response(200, 'Review deleted successfully')
    @api.response(404, 'Review not found')
    @jwt_required()
    def delete(self, review_id):
        current_user = get_jwt_identity()  # Get the current user's ID from the JWT token
        """Delete a review"""
        review = facade.get_review(review_id) # Get the review to check ownership
        if review.user.id != current_user:
            return {'error': 'Action unauthorized'}, 403
        try:
            facade.delete_review(review_id)
            return {'message': 'Review deleted successfully'}, 200
        except ValueError:
            return {'error': 'Review not found'}, 404
