from sqlalchemy import Column, ForeignKey, Integer, String

from .base_model import BaseModel
from app.extensions import db
from sqlalchemy.orm import validates

class Review(BaseModel):

	__tablename__ = 'reviews'

	text = Column(String(500), nullable=False)
	rating = Column(Integer, nullable=False)
	user_id = Column(String(36), ForeignKey('users.id'), nullable=False)
	place_id = Column(String(36), ForeignKey('places.id'), nullable=False)

	user = db.relationship('User', back_populates='reviews')
	place = db.relationship('Place', back_populates='reviews')

	def __init__(self, text, rating, place, user):
		super().__init__()
		self.text = text
		self.rating = rating
		self.place = place
		self.user = user

	@validates('text')
	def validate_text(self, key, value):
		"""Validate the text of the review."""
		if not isinstance(value, str):
			raise TypeError("Text must be a string")
		if not value:
			raise ValueError("Text cannot be empty")
		return value

	@validates('rating')
	def validate_rating(self, key, value):
		"""Validate the rating of the review."""
		if not isinstance(value, int):
			raise TypeError("Rating must be an integer")
		if value < 1 or value > 5:
			raise ValueError("Rating must be between 1 and 5")
		return value

	def to_dict(self):
		"""Convert the Review instance to a dictionary."""
		return {
			'id': self.id,
			'text': self.text,
			'rating': self.rating,
			'place_id': self.place_id,
			'user_id': self.user_id,
			'created_at': self.created_at.isoformat(),
			'updated_at': self.updated_at.isoformat()
		}
