from flask_jwt_extended import get_jwt_identity, jwt_required, get_jwt
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
    @api.response(403, 'Admin privileges required')
    @jwt_required()
    def post(self):
        """Register a new user (admin only)"""
        current_user = get_jwt()
        
        # Check if user is an admin
        if not current_user.get('is_admin', False):
            return {'error': 'Admin privileges required'}, 403
        
        user_data = api.payload

        # Simulate email uniqueness check (to be replaced by real validation with persistence)
        existing_user = facade.get_user_by_email(user_data['email'])
        if existing_user:
            return {'error': 'Email already registered'}, 400
        try:
            new_user = facade.create_user(user_data)
        except (ValueError, TypeError) as e:
            return {'error': str(e)}, 400

        return {'id': new_user.id, 'first_name': new_user.first_name, 'last_name': new_user.last_name, 'email': new_user.email}, 201


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
    @api.response(403, 'Admin privileges required')
    @api.response(404, 'User not found')
    @jwt_required()
    def put(self, user_id):
        """Update user details by ID (admin only)"""
        current_user = get_jwt()
        
        # Check if user is an admin
        if not current_user.get('is_admin', False):
            return {'error': 'Admin privileges required'}, 403
        
        user = facade.get_user(user_id)
        if not user:
            return {'error': 'User not found'}, 404
        
        user_data = api.payload
        email = user_data.get('email')
        
        # Ensure email uniqueness (if email is being updated)
        if email:
            existing_user = facade.get_user_by_email(email)
            if existing_user and existing_user.id != user_id:
                return {'error': 'Email already in use'}, 400
        
        try:
            updated_user = facade.update_user(user_id, user_data)
        except (ValueError, TypeError) as e:
            return {'error': str(e)}, 400
        return {'id': updated_user.id, 'first_name': updated_user.first_name, 'last_name': updated_user.last_name, 'email': updated_user.email}, 200
