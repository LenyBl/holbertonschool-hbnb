from app.models.review import Review
from app.extensions import db
from app.persistence.repository import SQLAlchemyRepository

class ReviewRepository(SQLAlchemyRepository):
    def __init__(self):
        super().__init__(Review)

    def get_reviews_by_place_id(self, place_id):
        """Get all reviews for a specific place."""
        return self.model.query.filter_by(place_id=place_id).all()

    def get_reviews_by_user_id(self, user_id):
        """Get all reviews written by a specific user."""
        return self.model.query.filter_by(user_id=user_id).all()