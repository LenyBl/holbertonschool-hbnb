# HBnB - Business Logic and API

## Description

Part 2 of the HBnB project implements the **Business Logic layer** and the **RESTful API** of the HBnB application (a simplified AirBnB clone). This part focuses on building a structured, layered architecture using the **Facade pattern** and exposes a documented API via **Flask-RESTX**.

All data is stored **in memory** (no database yet — that comes in Part 3).

---

## Project Structure

```
part2/
├── README.md
└── hbnb/
    ├── run.py                      # Application entry point
    ├── config.py                   # Configuration classes
    ├── requirements.txt            # Python dependencies
    └── app/
        ├── __init__.py             # App factory (create_app)
        ├── api/
        │   └── v1/
        │       ├── users.py        # User endpoints
        │       ├── places.py       # Place endpoints
        │       ├── amenities.py    # Amenity endpoints
        │       ├── reviews.py      # Review endpoints
        │       └── tests/
        │           ├── test_user_endpoints.py
        │           ├── test_place_endpoints.py
        │           ├── test_amenity_endpoints.py
        │           └── test_review_endpoints.py
        ├── models/
        │   ├── base_model.py       # Base class (id, timestamps)
        │   ├── user.py
        │   ├── place.py
        │   ├── amenity.py
        │   ├── review.py
        │   └── tests/
        │       ├── test_user.py
        │       ├── test_place.py
        │       └── test_amenity.py
        ├── services/
        │   ├── __init__.py         # Facade singleton
        │   └── facade.py           # HBnBFacade (service layer)
        └── persistence/
            └── repository.py       # InMemoryRepository
```

---

## Architecture

The project follows a **3-layer architecture**:

```
API Layer (Flask-RESTX)
        ↓
Service Layer (Facade)
        ↓
Persistence Layer (InMemoryRepository)
```

### Facade Pattern

A single `HBnBFacade` instance acts as the entry point for all business logic. The API endpoints never access the repositories directly — they always go through the facade. This decouples the API from the data layer.

### In-Memory Repository

Each entity (User, Place, Amenity, Review) has its own `InMemoryRepository` instance backed by a Python dictionary. This will be replaced by a database-backed repository in Part 3.

---

## Models

| Model | Key attributes | Validation |
|-------|---------------|------------|
| `User` | `first_name`, `last_name`, `email`, `is_admin` | name ≤ 50 chars, valid email format |
| `Place` | `title`, `description`, `price`, `latitude`, `longitude`, `owner` | price ≥ 0, lat ∈ [-90,90], lon ∈ [-180,180] |
| `Amenity` | `name` | name ≤ 100 chars, non-empty |
| `Review` | `text`, `rating`, `place`, `user` | rating ∈ [1,5], non-empty text |

All models inherit from `BaseModel` which provides:
- `id` — UUID4 string
- `created_at` / `updated_at` — ISO 8601 timestamps

---

## API Endpoints

### Users — `/api/v1/users`

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/v1/users/` | Create a new user |
| `GET` | `/api/v1/users/<user_id>` | Get user by ID |

### Places — `/api/v1/places`

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/v1/places/` | Create a new place |
| `GET` | `/api/v1/places/` | List all places |
| `GET` | `/api/v1/places/<place_id>` | Get place by ID |
| `PUT` | `/api/v1/places/<place_id>` | Update a place |

### Amenities — `/api/v1/amenities`

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/v1/amenities/` | Create a new amenity |
| `GET` | `/api/v1/amenities/` | List all amenities |
| `GET` | `/api/v1/amenities/<amenity_id>` | Get amenity by ID |
| `PUT` | `/api/v1/amenities/<amenity_id>` | Update an amenity |

### Reviews — `/api/v1/reviews`

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/v1/reviews/` | Create a new review |
| `GET` | `/api/v1/reviews/` | List all reviews |
| `GET` | `/api/v1/reviews/<review_id>` | Get review by ID |
| `PUT` | `/api/v1/reviews/<review_id>` | Update a review |
| `DELETE` | `/api/v1/reviews/<review_id>` | Delete a review |

Full interactive documentation is available at `/api/v1/` (Swagger UI).

---

## Installation and Usage

### Prerequisites

- Python 3.10+

### Setup

```bash
# Clone the repository
git clone https://github.com/<your-username>/holbertonschool-hbnb.git
cd holbertonschool-hbnb/part2/hbnb

# Install dependencies
pip install -r requirements.txt
```

### Run the application

```bash
python run.py
```

The API will be available at `http://127.0.0.1:5000`.
Swagger documentation: `http://127.0.0.1:5000/api/v1/`

---

## Running Tests

```bash
cd part2/hbnb

# Run all API endpoint tests
python -m unittest app.api.v1.tests.test_user_endpoints \
                   app.api.v1.tests.test_place_endpoints \
                   app.api.v1.tests.test_amenity_endpoints \
                   app.api.v1.tests.test_review_endpoints -v

# Run all model unit tests
python -m unittest app.models.tests.test_user \
                   app.models.tests.test_place \
                   app.models.tests.test_amenity -v
```

Each test class creates a fresh application instance with isolated in-memory storage, ensuring tests are fully independent.

---

## Authors

- **Auxance** — [GitHub](https://github.com/AuxanceC)
- **Leny** — [GitHub](https://github.com/LenyBl)
