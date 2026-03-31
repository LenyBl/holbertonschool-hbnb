from flask import Flask, redirect
from flask_restx import Api
from flask_cors import CORS
from app.extensions import db, bcrypt, jwt
from app.api.v1.users import api as users_ns
from app.api.v1.amenities import api as amenities_ns
from app.api.v1.places import api as places_ns
from app.api.v1.reviews import api as reviews_ns
from app.api.v1.auth import api as auth_ns
from app.services import facade

def create_app(config_class="config.DevelopmentConfig"):

    app = Flask(__name__)
    app.config.from_object(config_class)
    app.url_map.strict_slashes = False

    CORS(app,
         origins=["http://localhost:5173", "http://localhost:5174",
                  "http://127.0.0.1:5173", "http://127.0.0.1:5174"],
         supports_credentials=True,
         allow_headers=["Authorization", "Content-Type", "Accept"],
         methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"])

    db.init_app(app)

    bcrypt.init_app(app)
    jwt.init_app(app)

    @app.route('/')
    def index():
        return redirect('/api/v1/')

    api = Api(app, version='1.0', title='HBnB API',
              description='HBnB Application API', doc='/api/v1/')

    api.add_namespace(users_ns, path='/api/v1/users')
    api.add_namespace(amenities_ns, path='/api/v1/amenities')
    api.add_namespace(places_ns, path='/api/v1/places')
    api.add_namespace(reviews_ns, path='/api/v1/reviews')
    api.add_namespace(auth_ns, path='/api/v1/auth')
    return app
