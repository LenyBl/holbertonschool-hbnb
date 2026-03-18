# HBnB - Holberton BnB

A full-stack vacation rental application inspired by Airbnb, built as part of the Holberton School curriculum.

## Project Structure

This project is divided into 3 parts, each representing a phase of development:

```
holbertonschool-hbnb/
├── part1/          # Architecture & Design
├── part2/          # Basic API Implementation
├── part3/          # Full-stack with Database & Auth
└── README.md
```

### Part 1 - Architecture & Design

- High-level architecture diagrams
- Class diagrams (UML)
- Sequence diagrams
- Technical documentation

### Part 2 - Basic API Implementation

- RESTful API with Flask-RESTX
- In-memory persistence (Repository pattern)
- CRUD operations for Users, Places, Reviews, Amenities
- Model validation
- Unit tests

### Part 3 - Full-stack Application

- SQLAlchemy ORM integration (SQLite/MySQL)
- JWT authentication with Flask-JWT-Extended
- Password hashing with Bcrypt
- Role-based access control (Admin/User)
- Extended repository methods

---

## Features

- **Users**: Registration, authentication, profile management
- **Places**: List properties with location, price, and amenities
- **Reviews**: Rate and review places (1-5 stars)
- **Amenities**: Manage property features (WiFi, Pool, AC, etc.)

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Python, Flask |
| API | Flask-RESTX (Swagger docs) |
| Database | SQLAlchemy (SQLite / MySQL) |
| Authentication | JWT (Flask-JWT-Extended) |
| Security | Bcrypt password hashing |

---

## Quick Start

```bash
# Clone the repository
git clone https://github.com/<username>/holbertonschool-hbnb.git
cd holbertonschool-hbnb

# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # Linux/Mac
.venv\Scripts\activate     # Windows

# Install dependencies
cd part3/hbnb
pip install -r requirements.txt

# Run the application
python run.py
```

API available at: `http://localhost:5000/api/v1/`

---

## API Documentation

Interactive Swagger documentation is available at `/api/v1/` when the server is running.

### Main Endpoints

| Resource | Endpoint | Methods |
|----------|----------|---------|
| Auth | `/api/v1/auth/login` | POST |
| Users | `/api/v1/users/` | GET, POST, PUT |
| Places | `/api/v1/places/` | GET, POST, PUT |
| Reviews | `/api/v1/reviews/` | GET, POST, PUT, DELETE |
| Amenities | `/api/v1/amenities/` | GET, POST, PUT |

---

## Database Schema

```
users (1) ──────< places (N)
  │                  │
  │                  │
  └──< reviews (N) >─┘

places (N) >──< amenities (N)
       (place_amenity)
```

| Table | Description |
|-------|-------------|
| `users` | Registered users (owners/reviewers) |
| `places` | Properties listed on the platform |
| `reviews` | User reviews for places |
| `amenities` | Features available at places |
| `place_amenity` | Many-to-many junction table |

---

## Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@hbnb.io | admin1234 |

---

## Testing

```bash
cd part3/hbnb

# Run unit tests
python -m pytest

# Run API tests
./test_secured.sh
```

---

## Project Requirements

- Python 3.8+
- Flask
- Flask-RESTX
- Flask-SQLAlchemy
- Flask-JWT-Extended
- Flask-Bcrypt

---

## Author

Holberton School Project

---

## License

This project is for educational purposes as part of the Holberton School curriculum.
