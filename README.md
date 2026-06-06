## roxiler-assignmentt 

# Store Rating App : [Live Demo](https://roxiler-challenge-1.onrender.com) 

A full-stack web application where users can browse stores and submit ratings (1–5). Role-based access for Admins, Users, and Store Owners.

---

## 🔗 Live Versions

| Version | Description | Link |
|---------|-------------|------|
| **This (Polished)** | Structured codebase, clean UI per role | [Live Demo](https://roxiler-assignmentt-1.onrender.com) |
| **Rapid Dev** | Functional-first, built fast | [Live Demo](https://roxiler-challenge-1.onrender.com) |

# > Rapid development version repo → https://github.com/OmKardile/roxiler-challenge

---

##  Roles & What They Can Do

###  Admin
- Dashboard showing total users, stores, and ratings
- Add users of any role (Admin / User / Store Owner)
- Add stores and link them to a Store Owner
- View + filter all users by name, email, address, role
- View + filter all stores with average rating
- Click any user to see full details (store owners show their store's rating)
- Sort any table column ascending / descending

###  User
- Self-register via signup page
- Browse all registered stores
- Search stores by name or address
- See overall average rating per store
- Submit a rating (1–5) for any store
- Edit their previously submitted rating
- Change their password

###  Store Owner
- Log in (created by admin)
- View their store's average rating
- See a list of all users who rated their store + individual ratings
- Change their password

---

##  Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@storeapp.com` | `Admin@123` |
| User 1 | `user1@example.com` | `User@1234` |
| User 2 | `user2@example.com` | `User@1234` |
| Store Owner 1 | `owner1@example.com` | `Owner@123` |
| Store Owner 2 | `owner2@example.com` | `Owner@123` |

> Passwords must be 8–16 chars, include 1 uppercase and 1 special character.

---

##  Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React (Vite) + React Router + Axios |
| Backend | Node.js + Express |
| Database | MySQL |
| Auth | JWT + bcryptjs |

---

### Environment — `backend/.env`
```
PORT=5000
DB_HOST=localhost
DB_USER=w3-93109
DB_PASSWORD=omkarkar
DB_NAME=store_rating_db
JWT_SECRET=storerating_jwt_secret_2024
```

### Environment — `frontend/.env`
```
VITE_API_URL=http://localhost:5000/api
```

---

##  Project Structure

```
store-rating-app/
├── backend/
│   ├── src/
│   │   ├── config/db.js
│   │   ├── middleware/auth.js
│   │   └── routes/          # auth, admin, user, storeOwner
│   ├── seed.js
│   └── .env
├── frontend/
│   └── src/
│       └── pages/           # Login, Register, AdminDashboard,
│                            # UserDashboard, StoreOwnerDashboard
└── schema.sql
```

---

##  API Overview

| Method | Route | Access |
|--------|-------|--------|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| PUT | `/api/auth/password` | Any logged-in user |
| GET | `/api/admin/stats` | Admin |
| GET/POST | `/api/admin/users` | Admin |
| GET/POST | `/api/admin/stores` | Admin |
| GET | `/api/user/stores` | User |
| POST | `/api/user/ratings` | User |
| PUT | `/api/user/ratings/:store_id` | User |
| GET | `/api/store-owner/dashboard` | Store Owner |

---

##  Form Validation Rules

- **Name** — 20 to 60 characters
- **Address** — max 400 characters
- **Password** — 8–16 chars, at least 1 uppercase, 1 special character
- **Email** — standard email format