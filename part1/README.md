# 📘 Complete Technical Documentation — HBnB

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [High-Level Architecture Diagram (Package Diagram)](#2-high-level-architecture-diagram)
3. [Business Logic Layer](#3-business-logic-layer)
4. [Class Diagram](#4-class-diagram)
5. [Sequence Diagrams](#5-sequence-diagrams)
6. [Consistency Verification](#6-consistency-verification)
7. [Conclusion](#7-conclusion)

---

## 1. Introduction

The **HBnB** project is an application inspired by AirBnB, allowing users to register, publish places, leave reviews, and manage amenities. The architecture is based on a **3-tier model** (Presentation, Business Logic, Persistence) ensuring a clear separation of concerns.

This document gathers all the UML diagrams produced during the design phase, along with explanatory notes and a consistency analysis.

---

## 2. High-Level Architecture Diagram (Package Diagram)

### 🖼️ Diagram

![Layered Architecture](https://github.com/LenyBl/holbertonschool-hbnb/blob/c5914e3e0d66ebd7c184157eb177d6a6a3e93960/part1/diagram_high_package.png)

### 📝 Explanatory Notes

#### 2.1 — Presentation Layer

| Component | Role |
|---|---|
| **UserController** | Exposes REST endpoints related to users (`/api/users`) |
| **PlaceController** | Exposes REST endpoints related to places (`/api/places`) |
| **ReviewController** | Exposes REST endpoints related to reviews (`/api/reviews`) |
| **AmenityController** | Exposes REST endpoints related to amenities (`/api/amenities`) |

- This is the **entry point** for all HTTP requests coming from the client.
- Controllers contain **no business logic**; they immediately delegate processing to the layer below.
- Each controller communicates with the Business Logic Layer through the **Facade pattern**, ensuring loose coupling between layers.

#### 2.2 — Business Logic Layer

| Component | Role |
|---|---|
| **User** | Handles registration logic, profile updates, and user deletion |
| **Place** | Handles creation, modification, deletion, and listing of places, as well as adding/removing amenities |
| **Review** | Handles creation, modification, deletion, and listing of reviews by place |
| **Amenity** | Handles creation, modification, deletion, and listing of amenities |

- This layer encapsulates all **business rules** (validations, constraints, data transformations).
- The business entities (User, Place, Review, Amenity) are the core domain models.
- Communication with the Persistence Layer is done through **repositories**, allowing the storage method to be changed without impacting the business logic.

#### 2.3 — Persistence Layer

| Component | Role |
|---|---|
| **UserRepository** | CRUD operations on user data in the database |
| **PlaceRepository** | CRUD operations on place data in the database |
| **ReviewRepository** | CRUD operations on review data in the database |
| **AmenityRepository** | CRUD operations on amenity data in the database |

- Responsible for **saving and retrieving** data (database, files, memory).
- Implements the **Repository Pattern**, providing an abstract interface to the Business Logic Layer.
- Allows easy future migration (e.g., switching from in-memory storage to an SQL database).

#### 2.4 — Communication Flow Between Layers

```
Client (HTTP Request)
        │
        ▼
┌─────────────────────┐
│  PRESENTATION LAYER  │   ← Receives and parses the request
│   (Controllers)      │
└────────┬────────────┘
         │  Facade Pattern
         ▼
┌─────────────────────┐
│ BUSINESS LOGIC LAYER │   ← Applies business rules
│   (Entities/Models)  │
└────────┬────────────┘
         │  Repository Pattern
         ▼
┌─────────────────────┐
│  PERSISTENCE LAYER   │   ← Stores/Retrieves from database
│   (Repositories)     │
└─────────────────────┘
```

---

## 3. Business Logic Layer

The **Business Logic Layer** is the heart of the HBnB application. It contains all the domain entities, enforces business rules, and orchestrates the interactions between the Presentation and Persistence layers. Each entity inherits from `BaseModel`, which provides common attributes (`id`, `created_at`, `updated_at`) and utility methods (`save()`, `update()`).

---

### 3.1 — `BaseModel`

**File:** `base_model.py`

```
┌─────────────────────────────────────┐
│             BaseModel               │
├─────────────────────────────────────┤
│ + id         : str (UUID)           │
│ + created_at : datetime             │
│ + updated_at : datetime             │
├─────────────────────────────────────┤
│ + save()   : void                   │
│ + update(data: dict) : void         │
└─────────────────────────────────────┘
```

**Responsibilities:**
- Generates a **unique UUID** for every entity upon instantiation.
- Automatically records `created_at` and `updated_at` timestamps.
- `save()` refreshes the `updated_at` timestamp whenever the object is modified.
- `update(data)` applies a dictionary of attribute changes and calls `save()` automatically.

All four domain entities (`User`, `Place`, `Review`, `Amenity`) extend `BaseModel` and therefore inherit these cross-cutting concerns.

---

### 3.2 — `User`

**File:** `user.py`

```
┌────────────────────────────────────────┐
│                 User                   │
│           (extends BaseModel)          │
├────────────────────────────────────────┤
│ + first_name : str  (max 50 chars)     │
│ + last_name  : str  (max 50 chars)     │
│ + email      : str  (valid format)     │
│ + is_admin   : bool (default: False)   │
├────────────────────────────────────────┤
│ (inherited) id, created_at, updated_at │
│ (inherited) save(), update()           │
└────────────────────────────────────────┘
```

**Responsibilities:**
- Represents a **registered user** of the platform.
- Validates `first_name` and `last_name`: must be non-empty strings of at most 50 characters.
- Validates `email`: must be a non-empty string containing `@` and `.` (basic format check).
- `is_admin` is a boolean flag distinguishing standard users from administrators; defaults to `False`.
- All attributes are protected via **Python properties** with explicit setters that raise `ValueError` on invalid input.

**Business Rules enforced:**
| Attribute | Rule |
|---|---|
| `first_name` / `last_name` | Non-empty string, ≤ 50 characters |
| `email` | Must contain `@` and `.`; non-empty string |
| `is_admin` | Must be a boolean value |

---

### 3.3 — `Place`

**File:** `place.py`

```
┌────────────────────────────────────────────┐
│                   Place                    │
│             (extends BaseModel)            │
├────────────────────────────────────────────┤
│ + title       : str   (max 100 chars)      │
│ + description : str                        │
│ + price       : float (≥ 0)               │
│ + latitude    : float (−90 to 90)         │
│ + longitude   : float (−180 to 180)       │
│ + owner       : User                       │
│ + reviews     : List[Review]               │
│ + amenities   : List[Amenity]              │
├────────────────────────────────────────────┤
│ + add_review(review: Review)  : void       │
│ + add_amenity(amenity: Amenity) : void     │
│ (inherited) id, created_at, updated_at    │
│ (inherited) save(), update()              │
└────────────────────────────────────────────┘
```

**Responsibilities:**
- Represents an **accommodation listing** on the platform.
- `title` is validated to be a non-empty string stripped of whitespace, with a maximum of 100 characters.
- `description` is optional; whitespace-only values are normalized to an empty string.
- `price` must be a non-negative number (stored as `float`).
- `latitude` is constrained to `[−90, 90]` and `longitude` to `[−180, 180]`.
- `owner` must be a valid `User` instance — enforcing the ownership relationship at the model level.
- `add_review()` appends a `Review` instance to the internal `reviews` list after type validation.
- `add_amenity()` appends an `Amenity` instance to the internal `amenities` list after type validation.

**Business Rules enforced:**
| Attribute / Method | Rule |
|---|---|
| `title` | Non-empty string (stripped), ≤ 100 characters |
| `price` | Numeric (int or float), ≥ 0 |
| `latitude` | Float between −90 and 90 |
| `longitude` | Float between −180 and 180 |
| `owner` | Must be a `User` instance |
| `add_review()` | Argument must be a `Review` instance |
| `add_amenity()` | Argument must be an `Amenity` instance |

---

### 3.4 — `Review`

**File:** `review.py`

```
┌────────────────────────────────────────┐
│                Review                  │
│          (extends BaseModel)           │
├────────────────────────────────────────┤
│ + text   : str                         │
│ + rating : int  (1 – 5)               │
│ + place  : Place                       │
│ + user   : User                        │
├────────────────────────────────────────┤
│ (inherited) id, created_at, updated_at │
│ (inherited) save(), update()           │
└────────────────────────────────────────┘
```

**Responsibilities:**
- Represents a **review** submitted by a user about a place.
- `text` must be a non-empty string — the actual written feedback.
- `rating` must be an integer strictly between 1 and 5 inclusive.
- `place` must be a valid `Place` instance, establishing the link between the review and the reviewed accommodation.
- `user` must be a valid `User` instance, identifying the author of the review.
- All attributes use **property setters** to enforce invariants at assignment time.

**Business Rules enforced:**
| Attribute | Rule |
|---|---|
| `text` | Non-empty string |
| `rating` | Integer in the range [1, 5] |
| `place` | Must be a `Place` instance |
| `user` | Must be a `User` instance |

---

### 3.5 — `Amenity`

**File:** `amenity.py`

```
┌────────────────────────────────────────┐
│               Amenity                  │
│          (extends BaseModel)           │
├────────────────────────────────────────┤
│ + name : str  (max 100 chars)          │
├────────────────────────────────────────┤
│ (inherited) id, created_at, updated_at │
│ (inherited) save(), update()           │
└────────────────────────────────────────┘
```

**Responsibilities:**
- Represents a **feature or service** available at a place (e.g., Wi-Fi, swimming pool, parking).
- `name` must be a non-empty string with a maximum length of 100 characters.
- Amenities follow a **many-to-many** relationship with places: a single amenity (e.g., "Wi-Fi") can be associated with multiple places, and a place can list multiple amenities.
- The `Place.add_amenity()` method manages this association at runtime.

**Business Rules enforced:**
| Attribute | Rule |
|---|---|
| `name` | Non-empty string, ≤ 100 characters |

---

### 3.6 — Entity Relationships Summary

```
BaseModel
    │
    ├── User ──────────────────────────────────────┐
    │                                               │ owns (1 → 0..*)
    ├── Place ◄──────────────────────────────────── ┘
    │     │
    │     │ has (1 → 0..*)      contains (0..* ↔ 0..*)
    │     ├──────────────────► Review
    │     └──────────────────► Amenity
    │
    ├── Review  (links Place + User)
    └── Amenity (shared across Places)
```

| Relationship | Cardinality | Description |
|---|---|---|
| `User` → `Place` | 1 — 0..* | A user owns zero or more places |
| `User` → `Review` | 1 — 0..* | A user writes zero or more reviews |
| `Place` → `Review` | 1 — 0..* | A place receives zero or more reviews |
| `Place` ↔ `Amenity` | 0..* — 0..* | Many-to-many: a place has multiple amenities; an amenity can belong to multiple places |

---

## 4. Class Diagram

### 🖼️ Diagram

![Class Diagram](https://github.com/LenyBl/holbertonschool-hbnb/blob/c5914e3e0d66ebd7c184157eb177d6a6a3e93960/part1/diag_of_class.png)

### 📝 Explanatory Notes

#### 4.1 — `User` Class

```
┌────────────────────────────────┐
│            User                │
├────────────────────────────────┤
│ - int id                       │
│ - String firstName             │
│ - String lastName              │
│ - String email                 │
│ - String password              │
│ - Boolean isAdmin              │
│ - DateTime createdAt           │
│ - DateTime updatedAt           │
├────────────────────────────────┤
│ + register() : User            │
│ + updateProfile() : User       │
│ + delete() : Boolean           │
│ + getPlaces() : List<Place>    │
│ + getReviews() : List<Review>  │
└────────────────────────────────┘
```

- **Core entity** of the system representing a registered user.
- The `isAdmin` attribute distinguishes administrators from standard users.
- `email` serves as the unique identifier for authentication.
- The `register()` method creates a new user with password hashing.
- The `getPlaces()` and `getReviews()` methods allow navigation to associated entities.

#### 4.2 — `Place` Class

```
┌──────────────────────────────────┐
│             Place                │
├──────────────────────────────────┤
│ - int id                         │
│ - String title                   │
│ - String description             │
│ - Float price                    │
│ - Float latitude                 │
│ - Float longitude                │
│ - DateTime createdAt             │
│ - DateTime updatedAt             │
├──────────────────────────────────┤
│ + create() : Place               │
│ + update() : Place               │
│ + delete() : Boolean             │
│ + list() : List<Place>           │
│ + addAmenity() : void            │
│ + removeAmenity() : void         │
│ + getReviews() : List<Review>    │
└──────────────────────────────────┘
```

- Represents a **place/accommodation** available for rent.
- The `latitude`/`longitude` coordinates enable geolocation.
- `addAmenity()` and `removeAmenity()` manage the many-to-many relationship with amenities.
- `getReviews()` returns all reviews associated with this place.

#### 4.3 — `Review` Class

```
┌──────────────────────────────────┐
│            Review                │
├──────────────────────────────────┤
│ - int id                         │
│ - Integer rating                 │
│ - String comment                 │
│ - DateTime createdAt             │
│ - DateTime updatedAt             │
├──────────────────────────────────┤
│ + create() : Review              │
│ + update() : Review              │
│ + delete() : Boolean             │
│ + listByPlace() : List<Review>   │
└──────────────────────────────────┘
```

- Represents a **review** left by a user on a place.
- `rating` is an integer score (e.g., from 1 to 5).
- `listByPlace()` retrieves all reviews for a specific place.

#### 4.4 — `Amenity` Class

```
┌──────────────────────────────────┐
│           Amenity                │
├──────────────────────────────────┤
│ - int id                         │
│ - String name                    │
│ - String description             │
│ - DateTime createdAt             │
│ - DateTime updatedAt             │
├──────────────────────────────────┤
│ + create() : Amenity             │
│ + update() : Amenity             │
│ + delete() : Boolean             │
│ + list() : List<Amenity>         │
└──────────────────────────────────┘
```

- Represents an **amenity/service** available at a place (WiFi, pool, parking, etc.).
- Can be shared across multiple places (many-to-many relationship).

#### 4.5 — Relationships Between Classes

| Relationship | Type | Cardinality | Description |
|---|---|---|---|
| **User → Place** | `owns` | 1 — 0..* | A user owns zero or more places |
| **User → Review** | `writes` | 1 — 0..* | A user writes zero or more reviews |
| **Place → Review** | `has` | 1 — 0..* | A place receives zero or more reviews |
| **Place → Amenity** | `contains` | 0..* — 0..* | A place contains zero or more amenities; an amenity can belong to multiple places |

#### 4.6 — Common Attributes

All entities share the following attributes, suggesting the potential existence of an **abstract base class**:
- `id`: unique identifier
- `createdAt`: creation date
- `updatedAt`: last modification date

---

## 5. Sequence Diagrams

### 🖼️ Diagram

![Sequence Diagrams](https://github.com/LenyBl/holbertonschool-hbnb/blob/03308167b1bf53bcc9689a9048cae1803b689636/part1/sequence_diagrams.png)

The sequence diagrams illustrate the interactions between the **four participants** of the system for the main API calls:

| Participant | Layer | Role |
|---|---|---|
| **Client** | External | The user or application sending HTTP requests |
| **API** | Presentation Layer | The REST controller that receives and responds to requests |
| **Logic** | Business Logic Layer | The service/model that applies business logic |
| **Database** | Persistence Layer | The repository that persists data |

---

### 5.1 — POST `/api/users` (User Registration)

```
Client              API                Logic              Database
  │                  │                   │                   │
  │─[firstName,      │                   │                   │
  │  lastName,       │                   │                   │
  │  email,          │                   │                   │
  │  password]──────>│                   │                   │
  │                  │──register()──────>│                   │
  │                  │                   │──save(User)──────>│
  │                  │                   │<──────────✓───────│
  │                  │<──────User────────│                   │
  │<──201 Created────│                   │                   │
```

**Flow Description:**

1. The **Client** sends a POST request with registration data (firstName, lastName, email, password).
2. The **API** (UserController) receives the request and calls the `register()` method of the Logic layer.
3. The **Logic** layer (User) validates the data (unique email, password format, etc.), creates the User object, and requests persistence via `save(User)` to the Database.
4. The **Database** (UserRepository) persists the user and confirms the operation (✓).
5. The Logic layer returns the created **User** object to the API.
6. The API sends the Client a **201 Created** response with the user data.

---

### 5.2 — POST `/api/places` (Place Creation)

```
Client              API                Logic              Database
  │                  │                   │                   │
  │─[name,           │                   │                   │
  │  description,    │                   │                   │
  │  price,          │                   │                   │
  │  latitude,       │                   │                   │
  │  longitude]─────>│                   │                   │
  │                  │──createPlace()───>│                   │
  │                  │                   │──save(Place)─────>│
  │                  │                   │<──────────✓───────│
  │                  │<──────Place───────│                   │
  │<──201 Created────│                   │                   │
```

**Flow Description:**

1. The **Client** sends a POST request with place information (name, description, price, latitude, longitude).
2. The **API** (PlaceController) forwards to the Logic layer via `createPlace()`.
3. The **Logic** layer (Place) validates the data (positive price, valid coordinates, etc.), associates the place with the authenticated user, then saves via `save(Place)`.
4. The **Database** (PlaceRepository) persists the place and confirms (✓).
5. The **Place** object is returned through the layers.
6. The Client receives a **201 Created** response.

---

### 5.3 — POST `/api/reviews` (Review Creation)

```
Client              API                Logic              Database
  │                  │                   │                   │
  │─[rating,         │                   │                   │
  │  comment,        │                   │                   │
  │  place_id,       │                   │                   │
  │  user_id]───────>│                   │                   │
  │                  │──createReview()──>│                   │
  │                  │                   │──saveReview()────>│
  │                  │                   │<──────────✓───────│
  │                  │<──────Review──────│                   │
  │<──201 Created────│                   │                   │
```

**Flow Description:**

1. The **Client** sends a POST request with review data (rating, comment, place_id, user_id).
2. The **API** (ReviewController) forwards via `createReview()` to the Logic layer.
3. The **Logic** layer (Review) verifies that:
   - The place (`place_id`) exists
   - The user (`user_id`) exists
   - The user is not reviewing their own place (optional business rule)
   - The rating is within the allowed range
4. The **Database** (ReviewRepository) persists the review via `saveReview()` and confirms (✓).
5. The **Review** object is returned.
6. The Client receives a **201 Created** response.

---

### 5.4 — GET `/api/places` (Retrieve List of Places)

```
Client              API                Logic              Database
  │                  │                   │                   │
  │──request────────>│                   │                   │
  │                  │──getPlaces()─────>│                   │
  │                  │                   │──findAll()───────>│
  │                  │                   │<───List<Place>────│
  │                  │<──List<Place>─────│                   │
  │<──200 OK─────────│                   │                   │
```

**Flow Description:**

1. The **Client** sends a simple GET request (no body).
2. The **API** (PlaceController) calls `getPlaces()` in the Logic layer.
3. The **Logic** layer (Place) requests retrieval of all places via `findAll()` from the Database.
4. The **Database** (PlaceRepository) returns the **List\<Place\>** containing all places.
5. The list is passed through the layers.
6. The Client receives a **200 OK** response with the list of places.

---

## 6. Conclusion

This technical documentation presents the complete architecture of the **HBnB** project through three complementary types of UML diagrams:

| Diagram | What It Shows | Perspective |
|---|---|---|
| **Layered Architecture** | How the system is **organized** | Macro structure (deployment) |
| **Class Diagram** | How the data is **modeled** | Micro structure (domain) |
| **Sequence Diagrams** | How the components **interact** | Behavior (runtime) |

The three diagrams are **globally consistent** with each other:
- The **4 entities** (User, Place, Review, Amenity) appear in all three views.
- The **3-tier architecture** is respected in the sequence flows (Client → API → Logic → Database).
- The **methods** defined in the class diagram correspond to the calls visible in the sequence diagrams.
- The **Facade pattern** mentioned in the architecture is effectively implemented in the inter-layer interactions.

This documentation base will serve as a **reference** for the implementation of the different layers of the application.

---

## 7. Authors

- [Blee Leny](https://github.com/LenyBl)
- [Jourdan Auxance](https://github.com/JAuxance)

*Document written as part of the HBnB project – Holberton School* &nbsp;&nbsp;
<a href="https://www.holbertonschool.fr/" target="_blank"><img src="https://github.com/user-attachments/assets/7ec82675-15fc-4360-b5dc-eb344deeff06" width="70" align="middle" /></a>
