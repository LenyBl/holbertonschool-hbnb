from app import create_app
from app.services import facade

app = create_app()

# Initialize admin user on startup for testing
with app.app_context():
    existing_admin = facade.get_user_by_email('admin@example.com')
    if not existing_admin:
        admin_data = {
            'first_name': 'Admin',
            'last_name': 'User',
            'email': 'admin@example.com',
            'password': 'admin123'
        }
        admin = facade.create_user(admin_data)
        admin.is_admin = True
        print(f"✅ Admin user initialized: {admin.email}")

if __name__ == '__main__':
    app.run(debug=True)
