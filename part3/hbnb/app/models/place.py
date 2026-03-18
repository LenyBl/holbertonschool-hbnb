from .base_model import BaseModel
from sqlalchemy.orm import validates
from sqlalchemy import Column, String, ForeignKey, Float
from sqlalchemy.orm import relationship, synonym
from app.extensions import db

place_amenity = db.Table('place_amenity',
    db.Column('place_id', db.String(36), db.ForeignKey('places.id'), primary_key=True),
    db.Column('amenity_id', db.String(36), db.ForeignKey('amenities.id'), primary_key=True)
)

class Place(BaseModel):
    __tablename__ = 'places'

    title = Column(String(100), nullable=False)
    description = Column(String(500), nullable=True)
    price = Column(Float, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    user_id = Column(String(36), ForeignKey('users.id'), nullable=False)
    # Keep owner_id as an alias to preserve existing API and service compatibility.
    owner_id = synonym('user_id')

    owner = relationship('User', back_populates='places')
    reviews = relationship('Review', back_populates='place', cascade='all, delete-orphan')
    amenities = relationship('Amenity', secondary=place_amenity, back_populates='places')

    def __init__(self, title, description, price, latitude, longitude, owner):
        """Initialize a Place instance."""
        super().__init__()
        self.title = title
        self.description = description
        self.price = price
        self.latitude = latitude
        self.longitude = longitude
        self.owner = owner

    @validates('title')
    def validate_title(self, key, value):
        """Validate the title of the place."""
        if not isinstance(value, str):
            raise TypeError("Title must be a string")
        value = value.strip()
        if not value:
            raise ValueError("Title cannot be empty")
        if len(value) > 100:
            raise ValueError("Title cannot exceed 100 characters")
        return value

    @validates('description')
    def validate_description(self, key, value):
        """Validate the description of the place."""
        if not isinstance(value, str):
            raise TypeError("Description must be a string")
        if not value.strip():
            value = ""
        return value.strip()

    @validates('price')
    def validate_price(self, key, value):
        """Validate the price of the place."""
        if not isinstance(value, (int, float)):
            raise TypeError("Price must be a number")
        if value < 0:
            raise ValueError("Price cannot be negative")
        return float(value)

    @validates('latitude')
    def validate_latitude(self, key, value):
        """Validate the latitude of the place."""
        if not isinstance(value, (int, float)):
            raise TypeError("Latitude must be a number")
        if value < -90 or value > 90:
            raise ValueError("Latitude must be between -90 and 90")
        return float(value)

    @validates('longitude')
    def validate_longitude(self, key, value):
        """Validate the longitude of the place."""
        if not isinstance(value, (int, float)):
            raise TypeError("Longitude must be a number")
        if value < -180 or value > 180:
            raise ValueError("Longitude must be between -180 and 180")
        return float(value)

    def add_review(self, review):
        """Add a review to the place."""
        self.reviews.append(review)

    def add_amenity(self, amenity):
        """Add an amenity to the place."""
        self.amenities.append(amenity)

    def to_dict(self):
        """Convert the Place instance to a dictionary."""
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'price': self.price,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'owner_id': self.owner_id,
            'amenities': [amenity.to_dict() for amenity in self.amenities]
        }
