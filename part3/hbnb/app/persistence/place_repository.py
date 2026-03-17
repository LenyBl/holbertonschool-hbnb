from app.models.place import Place
from app.extensions import db
from app.persistence.repository import SQLAlchemyRepository

class PlaceRepository(SQLAlchemyRepository):
    def __init__(self):
        super().__init__(Place)

    def get_places_by_owner_id(self, owner_id):
        """Get all places for a specific owner."""
        return self.model.query.filter_by(owner_id=owner_id).all()