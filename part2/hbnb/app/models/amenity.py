from .base_model import BaseModel

class Amenity(BaseModel):
	def __init__(self, name):
		"""Initialize an Amenity instance."""
		super().__init__()
		self.name = name

	@property
	def name(self):
		"""Get the name of the amenity."""
		return self._name
	
	@name.setter
	def name(self, value):
		"""Set the name of the amenity."""
		if not isinstance(value, str):
			raise TypeError("Name must be a string")
		if len(value) > 100:
			raise ValueError("Name must be 100 characters or less")
		if not value:
			raise ValueError("Name cannot be empty")
		self._name = value
