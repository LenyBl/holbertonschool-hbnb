from .base_model import BaseModel
from .user import User
from .amenity import Amenity

class Place(BaseModel):
    def __init__(self, title, description, price, latitude, longitude, owner):
        """Initialize a Place instance."""
        super().__init__()
        self.title = title
        self.description = description
        self.price = price
        self.latitude = latitude
        self.longitude = longitude
        self.owner = owner
        self.reviews = []  # List to store related reviews
        self.amenities = []  # List to store related amenities

    @property
    def title(self):
        """Get the title of the place."""
        return self._title
    
    @title.setter
    def title(self, value):
        """Set the title of the place."""
        if not isinstance(value, str):
            raise TypeError("Title must be a string")
        value = value.strip()
        if not value:
            raise ValueError("Title cannot be empty")
        if len(value) > 100:
            raise ValueError("Title cannot exceed 100 characters")
        self._title = value

    @property
    def description(self):
        """Get the description of the place."""
        return self._description
    
    @description.setter
    def description(self, value):
        """Set the description of the place."""
        if not isinstance(value, str):
            raise TypeError("Description must be a string")
        if not value.strip():
            value = ""
        self._description = value.strip()

    @property
    def price(self):
        """Get the price of the place."""
        return self._price
    
    @price.setter
    def price(self, value):
        """Set the price of the place."""
        if not isinstance(value, (int, float)):
            raise TypeError("Price must be a number")
        if value < 0:
            raise ValueError("Price cannot be negative")
        self._price = float(value)

    @property
    def latitude(self):
        """Get the latitude of the place."""
        return self._latitude
    
    @latitude.setter
    def latitude(self, value):
        """Set the latitude of the place."""
        if not isinstance(value, (int, float)):
            raise TypeError("Latitude must be a number")
        if value < -90 or value > 90:
            raise ValueError("Latitude must be between -90 and 90")
        self._latitude = float(value)
    
    @property
    def longitude(self):
        """Get the longitude of the place."""
        return self._longitude
    
    @longitude.setter
    def longitude(self, value):
        """Set the longitude of the place."""
        if not isinstance(value, (int, float)):
            raise TypeError("Longitude must be a number")
        if value < -180 or value > 180:
            raise ValueError("Longitude must be between -180 and 180")
        self._longitude = float(value)

    @property
    def owner(self):
        """Get the owner of the place."""
        return self._owner
    
    @owner.setter
    def owner(self, user):
        """Set the owner of the place."""
        if not isinstance(user, User):
            raise TypeError("Owner must be a User instance")
        self._owner = user

    def add_review(self, review):
        """Add a review to the place."""
        from .review import Review
        if not isinstance(review, Review):
            raise TypeError("Review must be a Review instance")
        self.reviews.append(review)

    def add_amenity(self, amenity):
        """Add an amenity to the place."""
        if not isinstance(amenity, Amenity):
            raise TypeError("Amenity must be an Amenity instance")
        self.amenities.append(amenity)
