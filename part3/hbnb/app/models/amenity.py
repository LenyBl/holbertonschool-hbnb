from .base_model import BaseModel
from app.extensions import db
from sqlalchemy.orm import validates, relationship

class Amenity(BaseModel):
	__tablename__ = 'amenities'

	name = db.Column(db.String(100), nullable=False)
	places = relationship('Place', secondary='place_amenity', back_populates='amenities')

	def __init__(self, name):
		"""Initialize an Amenity instance."""
		super().__init__()
		self.name = name
	
	@validates('name')
	def validate_name(self, key, value):
		"""Validate the name of the amenity."""
		if not isinstance(value, str):
			raise TypeError("Name must be a string")
		if not value:
			raise ValueError("Name cannot be empty")
		if len(value) > 100:
			raise ValueError("Name must be 100 characters or less")
		return value

	def to_dict(self):
		"""Convert the Amenity instance to a dictionary."""
		return {
			'id': self.id,
			'name': self.name,
			'created_at': self.created_at.isoformat(),
			'updated_at': self.updated_at.isoformat()
		}
