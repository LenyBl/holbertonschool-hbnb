# 📘 Documentation Technique compete — HBnB

---

## Table des Matières

1. [Introduction](#1-introduction)
2. [Diagramme d'Architecture en Couches (Package Diagram)](#2-diagramme-darchitecture-en-couches)
3. [Diagramme de Classes (Class Diagram)](#3-diagramme-de-classes)
4. [Diagrammes de Séquence (Sequence Diagrams)](#4-diagrammes-de-séquence)
5. [Vérification de Cohérence](#5-vérification-de-cohérence)
6. [Conclusion](#6-conclusion)

---

## 1. Introduction

Le projet **HBnB** est une application inspirée d'AirBnB, permettant aux utilisateurs de s'inscrire, de publier des lieux (places), de laisser des avis (reviews) et de gérer des équipements (amenities). L'architecture repose sur un modèle **3-tiers** (Presentation, Business Logic, Persistence) garantissant une séparation claire des responsabilités.

Ce document rassemble l'ensemble des diagrammes UML produits lors de la phase de conception, accompagnés de notes explicatives et d'une analyse de cohérence.

---

## 2. Diagramme d'Architecture en Couches (Package Diagram)

### 🖼️ Diagramme

![Architecture en couches](https://github.com/LenyBl/holbertonschool-hbnb/blob/c5914e3e0d66ebd7c184157eb177d6a6a3e93960/part1/diag_of_class.png)

### 📝 Notes Explicatives

#### 2.1 — Presentation Layer (Couche de Présentation)

| Composant             | Rôle                                                                  |
| --------------------- | --------------------------------------------------------------------- |
| **UserController**    | Expose les endpoints REST relatifs aux utilisateurs (`/api/users`)    |
| **PlaceController**   | Expose les endpoints REST relatifs aux lieux (`/api/places`)          |
| **ReviewController**  | Expose les endpoints REST relatifs aux avis (`/api/reviews`)          |
| **AmenityController** | Expose les endpoints REST relatifs aux équipements (`/api/amenities`) |

- C'est le **point d'entrée** de toutes les requêtes HTTP venant du client.
- Les contrôleurs ne contiennent **aucune logique métier** ; ils délèguent immédiatement le traitement à la couche inférieure.
- Chaque contrôleur communique avec la Business Logic Layer via le **pattern Facade**, ce qui garantit un couplage faible entre les couches.

#### 2.2 — Business Logic Layer (Couche Logique Métier)

| Composant   | Rôle                                                                                                    |
| ----------- | ------------------------------------------------------------------------------------------------------- |
| **User**    | Gère la logique d'inscription, de mise à jour de profil, de suppression d'un utilisateur                |
| **Place**   | Gère la création, modification, suppression et listing des lieux, ainsi que l'ajout/retrait d'amenities |
| **Review**  | Gère la création, modification, suppression et listing des avis par lieu                                |
| **Amenity** | Gère la création, modification, suppression et listing des équipements                                  |

- Cette couche encapsule l'ensemble des **règles métier** (validations, contraintes, transformations de données).
- Les entités métier (User, Place, Review, Amenity) sont les modèles centraux du domaine.
- La communication avec la Persistence Layer se fait via les **repositories**, permettant de changer de mode de stockage sans impacter la logique métier.

#### 2.3 — Persistence Layer (Couche de Persistance)

| Composant             | Rôle                                                    |
| --------------------- | ------------------------------------------------------- |
| **UserRepository**    | Opérations CRUD sur les données utilisateur en base     |
| **PlaceRepository**   | Opérations CRUD sur les données des lieux en base       |
| **ReviewRepository**  | Opérations CRUD sur les données des avis en base        |
| **AmenityRepository** | Opérations CRUD sur les données des équipements en base |

- Responsable de la **sauvegarde et récupération** des données (base de données, fichiers, mémoire).
- Implémente le **Repository Pattern**, offrant une interface abstraite à la Business Logic Layer.
- Permet une migration future facile (ex : passage d'un stockage en mémoire à une base SQL).

#### 2.4 — Flux de Communication entre Couches

```
Client (HTTP Request)
        │
        ▼
┌─────────────────────┐
│  PRESENTATION LAYER  │   ← Reçoit la requête, la parse
│   (Controllers)      │
└────────┬────────────┘
         │  Facade Pattern
         ▼
┌─────────────────────┐
│ BUSINESS LOGIC LAYER │   ← Applique les règles métier
│   (Entities/Models)  │
└────────┬────────────┘
         │  Repository Pattern
         ▼
┌─────────────────────┐
│  PERSISTENCE LAYER   │   ← Stocke/Récupère en base
│   (Repositories)     │
└─────────────────────┘
```

> **Point clé** : Les dépendances vont **toujours du haut vers le bas**. Aucune couche inférieure ne dépend d'une couche supérieure, ce qui respecte le principe de **dépendance inversée**.

---

## 3. Diagramme de Classes (Class Diagram)

### 🖼️ Diagramme

![Diagramme de classes]([class_diagram.png](https://github.com/LenyBl/holbertonschool-hbnb/blob/c5914e3e0d66ebd7c184157eb177d6a6a3e93960/part1/diag_of_class.png))

### 📝 Notes Explicatives

#### 3.1 — Classe `User`

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

- **Entité centrale** du système représentant un utilisateur inscrit.
- L'attribut `isAdmin` permet de distinguer les administrateurs des utilisateurs standards.
- `email` sert d'identifiant unique pour l'authentification.
- La méthode `register()` crée un nouvel utilisateur avec hachage du mot de passe.
- Les méthodes `getPlaces()` et `getReviews()` permettent de naviguer vers les entités associées.

#### 3.2 — Classe `Place`

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

- Représente un **lieu/hébergement** mis en location.
- Les coordonnées `latitude`/`longitude` permettent la géolocalisation.
- `addAmenity()` et `removeAmenity()` gèrent la relation many-to-many avec les équipements.
- `getReviews()` retourne tous les avis associés à ce lieu.

#### 3.3 — Classe `Review`

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

- Représente un **avis** laissé par un utilisateur sur un lieu.
- `rating` est une note entière (ex : de 1 à 5).
- `listByPlace()` permet de récupérer tous les avis d'un lieu spécifique.

#### 3.4 — Classe `Amenity`

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

- Représente un **équipement/service** disponible dans un lieu (WiFi, piscine, parking, etc.).
- Peut être partagé par plusieurs lieux (relation many-to-many).

#### 3.5 — Relations entre les Classes

| Relation            | Type       | Cardinalité | Description                                                                                     |
| ------------------- | ---------- | ----------- | ----------------------------------------------------------------------------------------------- |
| **User → Place**    | `owns`     | 1 — 0..*    | Un utilisateur possède zéro ou plusieurs lieux                                                  |
| **User → Review**   | `writes`   | 1 — 0..*    | Un utilisateur rédige zéro ou plusieurs avis                                                    |
| **Place → Review**  | `has`      | 1 — 0..*    | Un lieu reçoit zéro ou plusieurs avis                                                           |
| **Place → Amenity** | `contains` | 0..* — 0..* | Un lieu contient zéro ou plusieurs équipements, un équipement peut appartenir à plusieurs lieux |

> **Point clé** : La relation Place ↔ Amenity est une **association many-to-many**, ce qui nécessitera une table de jointure en base de données (ex : `place_amenity`).

#### 3.6 — Attributs Communs

Toutes les entités partagent les attributs suivants, suggérant l'existence potentielle d'une **classe abstraite de base** :
- `id` : identifiant unique
- `createdAt` : date de création
- `updatedAt` : date de dernière modification

---

## 4. Diagrammes de Séquence (Sequence Diagrams)

### 🖼️ Diagramme

![Diagrammes de séquence]([sequence_diagrams.png](https://github.com/LenyBl/holbertonschool-hbnb/blob/03308167b1bf53bcc9689a9048cae1803b689636/part1/sequence_diagrams.png))

Les diagrammes de séquence illustrent les interactions entre les **quatre participants** du système pour les appels API principaux :

| Participant  | Couche               | Rôle                                                      |
| ------------ | -------------------- | --------------------------------------------------------- |
| **Client**   | Externe              | L'utilisateur ou application qui envoie les requêtes HTTP |
| **API**      | Presentation Layer   | Le contrôleur REST qui reçoit et répond aux requêtes      |
| **Logic**    | Business Logic Layer | Le service/modèle qui applique la logique métier          |
| **Database** | Persistence Layer    | Le repository qui persiste les données                    |

---

### 4.1 — POST `/api/users` (Inscription d'un utilisateur)

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

**Description du flux :**

1. Le **Client** envoie une requête POST avec les données d'inscription (firstName, lastName, email, password).
2. L'**API** (UserController) reçoit la requête et appelle la méthode `register()` de la couche Logic.
3. La couche **Logic** (User) valide les données (email unique, format du mot de passe, etc.), crée l'objet User et demande la sauvegarde via `save(User)` à la Database.
4. La **Database** (UserRepository) persiste l'utilisateur et confirme l'opération (✓).
5. La couche Logic retourne l'objet **User** créé à l'API.
6. L'API renvoie au Client une réponse **201 Created** avec les données de l'utilisateur.

> **Validations métier attendues** : unicité de l'email, mot de passe respectant les critères de sécurité, champs obligatoires non vides.

---

### 4.2 — POST `/api/places` (Création d'un lieu)

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

**Description du flux :**

1. Le **Client** envoie une requête POST avec les informations du lieu (name, description, price, latitude, longitude).
2. L'**API** (PlaceController) transmet à la couche Logic via `createPlace()`.
3. La couche **Logic** (Place) valide les données (prix positif, coordonnées valides, etc.), associe le lieu à l'utilisateur authentifié, puis sauvegarde via `save(Place)`.
4. La **Database** (PlaceRepository) persiste le lieu et confirme (✓).
5. L'objet **Place** est retourné à travers les couches.
6. Le Client reçoit une réponse **201 Created**.

> **Validations métier attendues** : prix > 0, latitude entre -90 et 90, longitude entre -180 et 180, utilisateur authentifié.

---

### 4.3 — POST `/api/reviews` (Création d'un avis)

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

**Description du flux :**

1. Le **Client** envoie une requête POST avec les données de l'avis (rating, comment, place_id, user_id).
2. L'**API** (ReviewController) transmet via `createReview()` à la couche Logic.
3. La couche **Logic** (Review) vérifie que :
   - Le lieu (`place_id`) existe
   - L'utilisateur (`user_id`) existe
   - L'utilisateur ne donne pas un avis sur son propre lieu (règle métier optionnelle)
   - Le rating est dans la plage autorisée
4. La **Database** (ReviewRepository) persiste l'avis via `saveReview()` et confirme (✓).
5. L'objet **Review** est retourné.
6. Le Client reçoit une réponse **201 Created**.

> **Validations métier attendues** : rating entre 1 et 5, place_id et user_id existants, commentaire non vide.

---

### 4.4 — GET `/api/places` (Récupération de la liste des lieux)

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

**Description du flux :**

1. Le **Client** envoie une requête GET simple (sans body).
2. L'**API** (PlaceController) appelle `getPlaces()` dans la couche Logic.
3. La couche **Logic** (Place) demande la récupération de tous les lieux via `findAll()` à la Database.
4. La **Database** (PlaceRepository) retourne la **List\<Place\>** contenant l'ensemble des lieux.
5. La liste est transmise à travers les couches.
6. Le Client reçoit une réponse **200 OK** avec la liste des lieux.

> **Note** : Dans une version future, cette requête pourrait accepter des paramètres de filtrage (prix max, localisation, etc.) et de pagination.

---
6. Conclusion
Cette documentation technique présente l'architecture complète du projet HBnB à travers trois types de diagrammes UML complémentaires :

| Diagramme               | Ce qu'il montre                      | Perspective                   |
| ----------------------- | ------------------------------------ | ----------------------------- |
| Architecture en couches | Comment le système est organisé      | Structure macro (déploiement) |
| Diagramme de classes    | Comment les données sont modélisées  | Structure micro (domaine)     |
| Diagrammes de séquence  | Comment les composants interagissent | Comportement (runtime)        |

Les trois diagrammes sont globalement cohérents entre eux :
Les 4 entités (User, Place, Review, Amenity) apparaissent dans les trois vues.
L'architecture 3-tiers est respectée dans les flux de séquence (Client → API → Logic → Database).
Les méthodes définies dans le diagramme de classes correspondent aux appels visibles dans les diagrammes de séquence.
Le pattern Facade mentionné dans l'architecture est effectivement mis en œuvre dans les interactions entre couches.

Cette base documentaire servira de référence pour l'implémentation des différentes couches de l'application.

---

Document rédigé dans le cadre du projet HBnB — Holberton School