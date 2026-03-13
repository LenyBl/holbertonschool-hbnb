from app import create_app
from app.models.user import User
from app.services import facade
from app.extensions import db

app = create_app()


def init_admin_user():
    """Create the default admin user in the DB if it doesn't exist."""
    admin = facade.ensure_admin_user('admin@example.com', 'admin123')
    print(f"Admin user ready: {admin.email} (id={admin.id})")


with app.app_context():
    # Ensure all tables exist, then bootstrap the admin user.
    db.create_all()
    init_admin_user()


if __name__ == '__main__':
    app.run(debug=True)
