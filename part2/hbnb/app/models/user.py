from .base_model import BaseModel

class User(BaseModel):
    def __init__(self, first_name, last_name, email, is_admin=False):
        """Initialize a User instance."""
        super().__init__()
        self.first_name = first_name
        self.last_name = last_name
        self.email = email
        self.is_admin = is_admin

    @property
    def first_name(self):
        """Get the first name of the user."""
        return self._first_name
    
    @first_name.setter
    def first_name(self, value):
        """Set the first name of the user."""
        if not isinstance(value, str):
            raise TypeError("First name must be a string")
        if len(value) > 50:
            raise ValueError("First name must be 50 characters or less")
        if not value:
            raise ValueError("First name cannot be empty")
        self._first_name = value

    @property
    def last_name(self):
        """Get the last name of the user."""
        return self._last_name
	
    @last_name.setter
    def last_name(self, value):
        """Set the last name of the user."""
        if not isinstance(value, str):
            raise TypeError("Last name must be a string")
        if len(value) > 50:
            raise ValueError("Last name must be 50 characters or less")
        if not value:
            raise ValueError("Last name cannot be empty")
        self._last_name = value

    @property
    def email(self):
        """Get the email of the user."""
        return self._email
	
    @email.setter
    def email(self, value):
        """Set the email of the user."""
        if "@" not in value or "." not in value:
            raise ValueError("Email must be a valid email address")
        if not isinstance(value, str):
            raise TypeError("Email must be a string")
        if not value:
            raise ValueError("Email cannot be empty")
        self._email = value

    @property
    def is_admin(self):
        """Get whether the user is an admin."""
        return self._is_admin
	
    @is_admin.setter
    def is_admin(self, value):
        """Set whether the user is an admin."""
        if not isinstance(value, bool):
            raise TypeError("is_admin must be a boolean")
        self._is_admin = value

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
