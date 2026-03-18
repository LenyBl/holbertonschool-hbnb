# HBnB - Holberton BnB Application

## Overview

HBnB is a full-stack vacation rental application built with Flask. It provides a RESTful API for managing users, places, reviews, and amenities with JWT authentication and SQLAlchemy ORM.

---

## Database Schema

![Database ER Diagram](docs/HBnB%20User%20and%20Place%20Review-2026-03-18-093437.png)

### Tables

| Table | Description |
|-------|-------------|
| `users` | Registered users (owners and reviewers) |
| `places` | Properties listed on the platform |
| `reviews` | User reviews for places |
| `amenities` | Features available at places (WiFi, Pool, etc.) |
| `place_amenity` | Many-to-many relationship between places and amenities |

### Relationships

- **User (1) → (N) Place**: A user can own multiple places
- **User (1) → (N) Review**: A user can write multiple reviews
- **Place (1) → (N) Review**: A place can have multiple reviews
- **Place (N) ↔ (N) Amenity**: Many-to-many via `place_amenity` table

---

## Project Structure

```
hbnb/
├── app/
│   ├── api/v1/           # REST API endpoints
│   │   ├── auth.py       # Authentication (login, JWT)
│   │   ├── users.py      # User CRUD operations
│   │   ├── places.py     # Place CRUD operations
│   │   ├── reviews.py    # Review CRUD operations
│   │   └── amenities.py  # Amenity CRUD operations
│   ├── models/           # SQLAlchemy models
│   │   ├── base_model.py # Base class (id, timestamps)
│   │   ├── user.py
│   │   ├── place.py
│   │   ├── review.py
│   │   └── amenity.py
│   ├── persistence/      # Repository pattern
│   │   ├── repository.py # Base repository
│   │   ├── user_repository.py
│   │   ├── place_repository.py
│   │   ├── review_repository.py
│   │   └── amenity_repository.py
│   └── services/
│       └── facade.py     # Business logic layer
├── sql/
│   ├── schema.sql        # MySQL schema
│   ├── schema_sqlite.sql # SQLite schema
│   └── seed.sql          # Initial data
├── docs/
│   └── *.png             # ER diagrams
├── config.py
├── run.py
└── requirements.txt
```

---

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd part3/hbnb

# Install dependencies
pip install -r requirements.txt

# Run the application
python run.py
```

The API will be available at `http://localhost:5000/api/v1/`

---

## API Endpoints

### Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/v1/auth/login` | Get JWT token | No |

### Users

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/v1/users/` | Create user | Admin |
| GET | `/api/v1/users/<id>` | Get user | No |
| PUT | `/api/v1/users/<id>` | Update user | Admin |

### Places

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/v1/places/` | Create place | JWT (auto owner_id) |
| GET | `/api/v1/places/` | List all places | No |
| GET | `/api/v1/places/<id>` | Get place details | No |
| PUT | `/api/v1/places/<id>` | Update place | Owner/Admin |

### Reviews

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/v1/reviews/` | Create review | JWT (auto user_id) |
| GET | `/api/v1/reviews/` | List all reviews | No |
| GET | `/api/v1/reviews/<id>` | Get review | No |
| PUT | `/api/v1/reviews/<id>` | Update review | Author/Admin |
| DELETE | `/api/v1/reviews/<id>` | Delete review | Author/Admin |

### Amenities

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/v1/amenities/` | Create amenity | Admin |
| GET | `/api/v1/amenities/` | List all amenities | No |
| GET | `/api/v1/amenities/<id>` | Get amenity | No |
| PUT | `/api/v1/amenities/<id>` | Update amenity | Admin |

---

## Usage Examples

### Login

```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@hbnb.io", "password": "admin1234"}'
```

### Create a Place

```bash
curl -X POST http://localhost:5000/api/v1/places/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "title": "Cozy Studio in Paris",
    "description": "Near the Eiffel Tower",
    "price": 89.99,
    "latitude": 48.8584,
    "longitude": 2.2945,
    "amenities": ["<amenity-id-1>", "<amenity-id-2>"]
  }'
```

### Create a Review

```bash
curl -X POST http://localhost:5000/api/v1/reviews/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "text": "Amazing place, highly recommend!",
    "rating": 5,
    "place_id": "<place-id>"
  }'
```

---

## Database Setup

### MySQL

```bash
mysql -u user -p database < sql/schema.sql
mysql -u user -p database < sql/seed.sql
```

### SQLite (Development)

```bash
sqlite3 instance/development.db < sql/schema_sqlite.sql
```

### Initial Data

- **Admin User**: `admin@hbnb.io` / `admin1234`
- **Amenities**: WiFi, Swimming Pool, Air Conditioning

---

## Models

### BaseModel

All entities inherit from `BaseModel`:

| Attribute | Type | Description |
|-----------|------|-------------|
| `id` | CHAR(36) | UUID primary key |
| `created_at` | TIMESTAMP | Creation timestamp |
| `updated_at` | TIMESTAMP | Last update timestamp |

### User

| Attribute | Type | Constraints |
|-----------|------|-------------|
| `first_name` | VARCHAR(255) | Required |
| `last_name` | VARCHAR(255) | Required |
| `email` | VARCHAR(255) | Required, Unique |
| `password` | VARCHAR(255) | Bcrypt hashed |
| `is_admin` | BOOLEAN | Default: FALSE |

### Place

| Attribute | Type | Constraints |
|-----------|------|-------------|
| `title` | VARCHAR(255) | Required |
| `description` | TEXT | Optional |
| `price` | DECIMAL(10,2) | Required, >= 0 |
| `latitude` | FLOAT | -90 to 90 |
| `longitude` | FLOAT | -180 to 180 |
| `owner_id` | CHAR(36) | FK → users.id |

### Review

| Attribute | Type | Constraints |
|-----------|------|-------------|
| `text` | TEXT | Required |
| `rating` | INT | 1-5 |
| `user_id` | CHAR(36) | FK → users.id |
| `place_id` | CHAR(36) | FK → places.id |

**Constraint**: UNIQUE(user_id, place_id) - One review per user per place

### Amenity

| Attribute | Type | Constraints |
|-----------|------|-------------|
| `name` | VARCHAR(255) | Required, Unique |

---

## Repository Methods

### UserRepository
- `get_user_by_email(email)`
- `get_all_admins()`

### PlaceRepository
- `get_places_by_owner_id(owner_id)`
- `get_places_by_price_range(min_price, max_price)`
- `get_places_by_location(latitude, longitude, radius)`

### ReviewRepository
- `get_reviews_by_place_id(place_id)`
- `get_reviews_by_user_id(user_id)`

### AmenityRepository
- `get_amenity_by_name(name)`
- `get_amenities_by_place_id(place_id)`

---

## Validation Rules

- **User**: Names max 50 chars, valid email format
- **Place**: Price >= 0, latitude -90/90, longitude -180/180
- **Review**: Rating 1-5, cannot review own place, one review per place
- **Amenity**: Name max 100 chars

---

## Technologies

- **Backend**: Flask, Flask-RESTX
- **Database**: SQLAlchemy ORM (SQLite/MySQL)
- **Authentication**: Flask-JWT-Extended
- **Password Hashing**: Flask-Bcrypt
