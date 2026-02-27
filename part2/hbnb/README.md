# HBnB - Business Logic Layer

## Overview

The Business Logic layer forms the core of the HBnB application. It defines the main entities (models) and enforces all validation rules and relationships between them. This layer is built on top of a shared `BaseModel` that provides common attributes and behaviors.

---

## Architecture

```
base_model.py   ← Shared base class (id, timestamps, save/update)
user.py         ← User entity
amenity.py      ← Amenity entity
place.py        ← Place entity (owns reviews & amenities)
review.py       ← Review entity (linked to Place & User)
```

---

## Entities & Responsibilities

### BaseModel (`base_model.py`)

The foundation of all entities. Every model inherits from `BaseModel`.

**Attributes:**
| Attribute    | Type       | Description                          |
|--------------|------------|--------------------------------------|
| `id`         | `str`      | Unique UUID generated at creation    |
| `created_at` | `datetime` | Timestamp of creation                |
| `updated_at` | `datetime` | Timestamp of last update             |

**Methods:**
- `save()` — Updates the `updated_at` timestamp.
- `update(data: dict)` — Updates attributes from a dictionary and calls `save()`.

---

### User (`user.py`)

Represents a registered user of the platform. Users can own places and write reviews.

**Attributes:**
| Attribute    | Type   | Constraints                              |
|--------------|--------|------------------------------------------|
| `first_name` | `str`  | Required, max 50 characters              |
| `last_name`  | `str`  | Required, max 50 characters              |
| `email`      | `str`  | Required, must contain `@` and `.`       |
| `is_admin`   | `bool` | Default: `False`                         |

**Validation Rules:**
- Names must be non-empty strings of at most 50 characters.
- Email must be a valid format (contains `@` and `.`).
- `is_admin` must be a boolean.

---

### Amenity (`amenity.py`)

Represents a feature or facility available at a place (e.g., WiFi, Pool).

**Attributes:**
| Attribute | Type  | Constraints                        |
|-----------|-------|------------------------------------|
| `name`    | `str` | Required, max 100 characters       |

**Validation Rules:**
- Name must be a non-empty string of at most 100 characters.

---

### Place (`place.py`)

Represents a property or location listed on the platform. A place is owned by a `User` and can have associated `Review` and `Amenity` objects.

**Attributes:**
| Attribute     | Type    | Constraints                                  |
|---------------|---------|----------------------------------------------|
| `title`       | `str`   | Required, max 100 characters                 |
| `description` | `str`   | Optional, defaults to empty string           |
| `price`       | `float` | Must be a non-negative number                |
| `latitude`    | `float` | Between -90 and 90                           |
| `longitude`   | `float` | Between -180 and 180                         |
| `owner`       | `User`  | Must be a valid `User` instance              |
| `reviews`     | `list`  | Auto-initialized, stores `Review` objects    |
| `amenities`   | `list`  | Auto-initialized, stores `Amenity` objects   |

**Methods:**
- `add_review(review: Review)` — Appends a `Review` to the place's review list.
- `add_amenity(amenity: Amenity)` — Appends an `Amenity` to the place's amenity list.

**Validation Rules:**
- `title` must be a non-empty string, stripped of whitespace.
- `price` must be numeric and non-negative.
- `latitude` must be between -90 and 90.
- `longitude` must be between -180 and 180.
- `owner` must be a `User` instance.

---

### Review (`review.py`)

Represents a user's review of a place, including a text comment and a numeric rating.

**Attributes:**
| Attribute | Type    | Constraints                              |
|-----------|---------|------------------------------------------|
| `text`    | `str`   | Required, non-empty                      |
| `rating`  | `int`   | Integer between 1 and 5 (inclusive)      |
| `place`   | `Place` | Must be a valid `Place` instance         |
| `user`    | `User`  | Must be a valid `User` instance          |

**Validation Rules:**
- `text` must be a non-empty string.
- `rating` must be an integer between 1 and 5.
- `place` and `user` must be instances of `Place` and `User` respectively.

---

## Relationships Between Entities

```
User ──────────────────────────── owns ──► Place
                                             │
                              has many ──► Review  (written by User)
                              has many ──► Amenity
```

- A **User** can own multiple **Places**.
- A **Place** can have multiple **Reviews** and **Amenities**.
- A **Review** is associated with exactly one **Place** and one **User**.

---

## Usage Examples

### Creating a User

```python
from models.user import User

user = User(
    first_name="Alice",
    last_name="Dupont",
    email="alice@example.com",
    is_admin=False
)
print(user.id)          # e.g. "a1b2c3d4-..."
print(user.first_name)  # "Alice"
```

---

### Creating an Amenity

```python
from models.amenity import Amenity

wifi = Amenity(name="WiFi")
pool = Amenity(name="Swimming Pool")
print(wifi.name)  # "WiFi"
```

---

### Creating a Place

```python
from models.place import Place

place = Place(
    title="Cozy Studio in Paris",
    description="A lovely studio near the Eiffel Tower.",
    price=89.99,
    latitude=48.8584,
    longitude=2.2945,
    owner=user
)
print(place.title)   # "Cozy Studio in Paris"
print(place.price)   # 89.99
print(place.owner)   # <User object>
```

---

### Adding Amenities to a Place

```python
place.add_amenity(wifi)
place.add_amenity(pool)
print(len(place.amenities))  # 2
```

---

### Creating a Review

```python
from models.review import Review

review = Review(
    text="Absolutely wonderful stay, highly recommend!",
    rating=5,
    place=place,
    user=user
)
place.add_review(review)
print(review.rating)        # 5
print(len(place.reviews))   # 1
```

---

### Updating an Entity

```python
# Using the update() method from BaseModel
place.update({"title": "Charming Studio in Paris", "price": 95.0})
print(place.title)  # "Charming Studio in Paris"
print(place.price)  # 95.0
# updated_at is automatically refreshed
```

---

### Handling Validation Errors

```python
try:
    bad_user = User(first_name="", last_name="Smith", email="smith@example.com")
except ValueError as e:
    print(e)  # "First name cannot be empty"

try:
    bad_place = Place(title="Test", description="", price=-10, latitude=0, longitude=0, owner=user)
except ValueError as e:
    print(e)  # "Price cannot be negative"

try:
    bad_review = Review(text="Nice", rating=6, place=place, user=user)
except ValueError as e:
    print(e)  # "Rating must be between 1 and 5"
```

---

## Testing Process

The business logic layer was tested through a combination of unit tests and manual validation scripts covering both the happy path and edge cases.

### Successful Cases

**User creation and validation:**
- Valid user created with correct `first_name`, `last_name`, `email`, and `is_admin` values.
- `id`, `created_at`, and `updated_at` are automatically set on instantiation.
- `save()` correctly refreshes `updated_at` without altering other attributes.
- `update()` patches only existing attributes; unknown keys are ignored.

**Amenity creation:**
- Amenity with a valid name (e.g., `"WiFi"`) is created and stored correctly.
- Maximum-length name (100 characters) is accepted without error.

**Place creation and relationships:**
- Place created with all required fields correctly stores values.
- `add_review()` and `add_amenity()` append objects to their respective lists.
- Multiple amenities and reviews can be attached to the same place.
- `owner` references the exact `User` instance passed at creation.

**Review creation:**
- Review created with valid `text`, `rating` (1–5), `place`, and `user` fields.
- Rating boundary values `1` and `5` are both accepted.

---

### Edge Cases Handled

**Empty or whitespace-only strings:**
- `User(first_name="")` raises `ValueError: First name cannot be empty`.
- `User(first_name="   ")` (whitespace only) raises `ValueError` after stripping.
- `Place(title="")` raises `ValueError: Title cannot be empty`.
- `Review(text="")` raises `ValueError: Text cannot be empty`.

**String length limits:**
- `User(first_name="A" * 51)` raises `ValueError` — exceeds 50-character limit.
- `Amenity(name="X" * 101)` raises `ValueError` — exceeds 100-character limit.
- `Place(title="T" * 101)` raises `ValueError` — exceeds 100-character limit.

**Invalid email format:**
- `User(email="notanemail")` raises `ValueError` — missing `@` and `.`.
- `User(email="missing-dot@domain")` raises `ValueError` — no `.` after `@`.

**Numeric boundary violations:**
- `Place(price=-1)` raises `ValueError: Price cannot be negative`.
- `Place(latitude=91)` raises `ValueError` — exceeds valid range of −90 to 90.
- `Place(latitude=-91)` raises `ValueError` — below valid range.
- `Place(longitude=181)` raises `ValueError` — exceeds valid range of −180 to 180.
- `Review(rating=0)` raises `ValueError` — below minimum of 1.
- `Review(rating=6)` raises `ValueError` — above maximum of 5.

**Wrong types for relational fields:**
- Passing a string instead of a `User` instance as `place.owner` raises `TypeError`.
- Passing a string instead of a `Place` instance as `review.place` raises `TypeError`.
- Passing `None` as `user` in a `Review` raises `TypeError`.

**Boolean validation:**
- `User(is_admin="yes")` raises `TypeError` — `is_admin` must be a boolean.

**`update()` method safety:**
- Calling `update({"nonexistent_field": "value"})` silently ignores the unknown key, leaving the object unchanged.
- Calling `update({})` is a no-op and does not raise an error.

---

## Notes

- All entities automatically receive a unique `id` (UUID4) and `created_at` / `updated_at` timestamps upon instantiation.
- All attribute setters perform strict type and value validation, raising `TypeError` or `ValueError` with descriptive messages on invalid input.
- The `update()` method only modifies attributes that already exist on the object, preventing arbitrary attribute injection.
