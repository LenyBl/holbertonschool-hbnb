from flask_jwt_extended import get_jwt_identity, jwt_required
from flask_restx import Namespace, Resource, fields
from app.services import facade

api = Namespace('users', description='User operations')

# Define the user model for input validation and documentation
user_model = api.model('User', {
    'first_name': fields.String(required=True, description='First name of the user'),
    'last_name': fields.String(required=True, description='Last name of the user'),
    'email': fields.String(required=True, description='Email of the user'),
    'password': fields.String(required=True, description='Password for the user')
})


@api.route('/')
class UserList(Resource):
    @api.expect(user_model, validate=True)
    @api.response(201, 'User successfully created')
    @api.response(400, 'Email already registered')
    @api.response(400, 'Invalid input data')
    def post(self):
        """Register a new user"""
        user_data = api.payload

        # Simulate email uniqueness check (to be replaced by real validation with persistence)
        existing_user = facade.get_user_by_email(user_data['email'])
        if existing_user:
            return {'error': 'Email already registered'}, 400
        try:
            new_user = facade.create_user(user_data)
        except (ValueError, TypeError) as e:
            return {'error': str(e)}, 400

        return {'id': new_user.id, 'message': 'User created successfully'}, 201


@api.route('/<user_id>')
class UserResource(Resource):
    @api.response(200, 'User details retrieved successfully')
    @api.response(404, 'User not found')
    def get(self, user_id):
        """Get user details by ID"""
        user = facade.get_user(user_id)
        if not user:
            return {'error': 'User not found'}, 404
        return {'id': user.id, 'first_name': user.first_name, 'last_name': user.last_name, 'email': user.email}, 200
    
    @api.response(200, 'User updated successfully')
    @api.response(400, 'Invalid input data')
    @api.response(403, 'Unauthorized action')
    @api.response(404, 'User not found')
    @jwt_required()
    def put(self, user_id):
        """Update user details by ID"""
        current_user = get_jwt_identity()
        if user_id != current_user:
            return {'error': 'Unauthorized action'}, 403
        user_data = api.payload
        if 'email' in user_data or 'password' in user_data:
            return {'error': 'You cannot modify email or password'}, 400
        user = facade.get_user(user_id)
        if not user:
            return {'error': 'User not found'}, 404
        try:
            updated_user = facade.update_user(user_id, user_data)
        except (ValueError, TypeError) as e:
            return {'error': str(e)}, 400
        return {'id': updated_user.id, 'message': 'User updated successfully'}, 200
