### README (Downloadable) — Project Documentation (Diagrams)

> Copy the content below into a file named `README.md`.

---

## 1) Included Diagrams

- **Class Diagram (Domain Model)**: `User`, `Place`, `Review`, `Amenity`
- **Layered Architecture Diagram**: Presentation → Business Logic → Persistence
- **Sequence Diagram (API Flows)**:  
  `POST /api/users`, `POST /api/places`, `POST /api/reviews`, `GET /api/places`

---

## 2) Class Diagram
![Alt text](https://github.com/LenyBl/holbertonschool-hbnb/blob/c5914e3e0d66ebd7c184157eb177d6a6a3e93960/part1/diag_of_class.png)
### **User**
- Stores user data: name, email, password, admin flag, timestamps.
- Main actions shown: register, update profile, delete, list places/reviews.

### **Place**
- Represents a place (title/description/price + coordinates + timestamps).
- Can be created/updated/deleted/listed.
- Can manage amenities (add/remove).
- Can return its reviews.

### **Review**
- A user’s review about a place (rating + comment + timestamps).
- Can be created/updated/deleted.
- Can be listed by place.

### **Amenity**
- An equipment/feature (name + description + timestamps).
- Can be created/updated/deleted/listed.

---

## 3) Architecture Diagram

- **Presentation Layer**: `UserController`, `PlaceController`, `ReviewController`, `AmenityController`
- **Facade**: sits between controllers and business objects (simplifies calls)
- **Business Logic Layer**: domain objects `User`, `Place`, `Review`, `Amenity`
- **Persistence Layer**: repositories (`UserRepository`, `PlaceRepository`, `ReviewRepository`, `AmenityRepository`)

**Goal:** keep API (controllers) separate from core rules (business) and database access (repositories).

---

## 4) Sequence Diagram — What It Shows

- **POST `/api/users`**: create a user → save in DB → return `201 Created`
- **POST `/api/places`**: create a place → save in DB → return `201 Created`
- **POST `/api/reviews`**: create a review → save in DB → return `201 Created`
- **GET `/api/places`**: fetch all places → return `200 OK`

---

## 5) Consistency Checks (Important)

- **Field name mismatch:** `Place.title` (class diagram) vs `name` (API sequence).  
  ✅ Pick one naming and use it everywhere.

- **CRUD methods inside entities:** class diagram shows `create/update/delete/list` inside entities.  
  ✅ In layered architecture, these often belong to **Services/Facades**, not entities.

- **Amenity API missing in sequence diagram:** architecture includes `AmenityController`, but sequences don’t show amenity endpoints.  
  ✅ Add flows like `GET /api/amenities`, `POST /api/amenities`, and Place↔Amenity linking.

- **Place ↔ Amenity relation unclear:** is it many-to-many or one-to-many?  
  ✅ Decide and document it (often many-to-many).

---

## 6) Next Steps (Optional)

- Add an **API Endpoints** section (list routes + request/response examples).
- Add a **Data Model** section (tables + relationships).
- Add missing **sequence diagrams** for amenity management.

---