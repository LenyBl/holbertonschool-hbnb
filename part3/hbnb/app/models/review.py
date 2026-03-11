from .base_model import BaseModel
from .user import User

class Review(BaseModel):
	"""Review class representing a review of a place."""
	def __init__(self, text, rating, place, user):
		super().__init__()
		self.text = text
		self.rating = rating
		self.place = place
		self.user = user
	
	@property
	def text(self):
		"""Get the text of the review."""
		return self._text
	
	@text.setter
	def text(self, value):
		"""Set the text of the review."""
		if not isinstance(value, str):
			raise TypeError("Text must be a string")
		if not value:
			raise ValueError("Text cannot be empty")
		self._text = value

	@property
	def rating(self):
		"""Get the rating of the review."""
		return self._rating
	
	@rating.setter
	def rating(self, value):
		"""Set the rating of the review."""
		if not isinstance(value, int):
			raise TypeError("Rating must be an integer")
		if value < 1 or value > 5:
			raise ValueError("Rating must be between 1 and 5")
		self._rating = value
	
	@property
	def place(self):
		"""Get the place associated with the review."""
		return self._place
	
	@place.setter
	def place(self, value):
		"""Set the place associated with the review."""
		from .place import Place
		if not isinstance(value, Place):
			raise TypeError("Place must be an instance of Place")
		self._place = value
	
	@property
	def user(self):
		"""Get the user associated with the review."""
		return self._user
	
	@user.setter
	def user(self, value):
		"""Set the user associated with the review."""
		if not isinstance(value, User):
			raise TypeError("User must be an instance of User")
		self._user = value

	def to_dict(self):
		"""Convert the Review instance to a dictionary."""
		return {
			'id': self.id,
			'text': self.text,
			'rating': self.rating,
			'place_id': self.place.id,
			'user_id': self.user.id,
			'created_at': self.created_at.isoformat(),
			'updated_at': self.updated_at.isoformat()
		}
