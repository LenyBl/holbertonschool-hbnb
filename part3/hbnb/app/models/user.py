import bcrypt
from app.extensions import db
from .base_model import BaseModel
from sqlalchemy.orm import validates


class User(BaseModel):
    __tablename__ = 'users'

    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(128), nullable=False)
    is_admin = db.Column(db.Boolean, default=False)

    def __init__(self, first_name, last_name, email, password, is_admin=False):
        """Initialize a User instance."""
        super().__init__()
        self.first_name = first_name
        self.last_name = last_name
        self.email = email
        self.password = password
        self.is_admin = is_admin

    @validates('first_name')
    def validate_first_name(self, key, value):
        """Validate the first name of the user."""
        if not isinstance(value, str):
            raise TypeError("First name must be a string")
        if not value:
            raise ValueError("First name cannot be empty")
        if len(value) > 50:
            raise ValueError("First name must be 50 characters or less")
        return value

    @validates('last_name')
    def validate_last_name(self, key, value):
        """Validate the last name of the user."""
        if not isinstance(value, str):
            raise TypeError("Last name must be a string")
        if not value:
            raise ValueError("Last name cannot be empty")
        if len(value) > 50:
            raise ValueError("Last name must be 50 characters or less")
        return value

    @validates('email')
    def validate_email(self, key, value):
        """Validate the email of the user."""
        if not isinstance(value, str):
            raise TypeError("Email must be a string")
        if not value:
            raise ValueError("Email cannot be empty")
        if "@" not in value or "." not in value:
            raise ValueError("Email must be a valid email address")
        return value

    @validates('is_admin')
    def validate_is_admin(self, key, value):
        """Validate whether the user is an admin."""
        if not isinstance(value, bool):
            raise TypeError("is_admin must be a boolean")
        return value

    def to_dict(self):
        """Convert the User instance to a dictionary."""
        return {
            'id': self.id,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'email': self.email,
            'is_admin': self.is_admin,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

    def hash_password(self, password):
        """Hash the user's password."""
        self.password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    def verify_password(self, password):
        """Verify the user's password."""
        return bcrypt.checkpw(password.encode('utf-8'), self.password.encode('utf-8'))
