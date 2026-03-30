from app.models.user import User
from app.extensions import db
from app.persistence.repository import SQLAlchemyRepository

class UserRepository(SQLAlchemyRepository):
    def __init__(self):
        super().__init__(User)

    def get_user_by_email(self, email):
        """Get a user by their email."""
        return self.model.query.filter_by(email=email).first()

    def get_all_admins(self):
        """Get all admin users."""
        return self.model.query.filter_by(is_admin=True).all()
