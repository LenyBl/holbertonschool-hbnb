from app.models.amenity import Amenity
from app.extensions import db
from app.persistence.repository import SQLAlchemyRepository

class AmenityRepository(SQLAlchemyRepository):
    def __init__(self):
        super().__init__(Amenity)

    def get_amenity_by_name(self, name):
        """Get an amenity by its name."""
        return self.model.query.filter_by(name=name).first()

    def get_amenities_by_place_id(self, place_id):
        """Get all amenities for a specific place."""
        from app.models.place import Place
        place = Place.query.get(place_id)
        if place:
            return place.amenities
        return []