from app.models.place import Place
from app.extensions import db
from app.persistence.repository import SQLAlchemyRepository

class PlaceRepository(SQLAlchemyRepository):
    def __init__(self):
        super().__init__(Place)

    def get_places_by_owner_id(self, owner_id):
        """Get all places for a specific owner."""
        return self.model.query.filter_by(owner_id=owner_id).all()

    def get_places_by_price_range(self, min_price, max_price):
        """Get all places within a price range."""
        return self.model.query.filter(
            self.model.price >= min_price,
            self.model.price <= max_price
        ).all()

    def get_places_by_location(self, latitude, longitude, radius):
        """Get all places within a radius (in degrees) from a point."""
        return self.model.query.filter(
            self.model.latitude >= latitude - radius,
            self.model.latitude <= latitude + radius,
            self.model.longitude >= longitude - radius,
            self.model.longitude <= longitude + radius
        ).all()