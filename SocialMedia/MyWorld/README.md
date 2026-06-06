# MyWorld

A full-stack social media application built as a portfolio project. MyWorld demonstrates modern web development with **React**, **GraphQL**, **Node.js**, **PostgreSQL**, and **real-time subscriptions**.

Live features include a social feed, user profiles, friend connections, groups, marketplace, likes, comments, and live feed updates.

---

## Features

| Feature | Description |
|---------|-------------|
| **Authentication** | Register, login, JWT-secured sessions |
| **Feed** | Create posts, like, comment, live updates via GraphQL subscriptions |
| **Profiles** | View/edit bio, post history, delete own posts |
| **Connections** | Search users, send/accept/reject friend requests |
| **Groups** | Create/join groups, group posts, likes |
| **Marketplace** | List items, browse, send/accept/decline offers |
| **GraphQL API** | Primary API at `/graphql` with queries, mutations, subscriptions |
| **REST API** | Legacy endpoints retained for reference |

---

## Tech Stack

### Frontend
- React 18 + Vite
- Apollo Client (GraphQL + WebSocket subscriptions)
- React Router

### Backend
- Node.js + Express
- Apollo Server 4 (GraphQL)
- PostgreSQL (`pg`)
- JWT + bcryptjs
- graphql-ws (real-time subscriptions)

### Database
- PostgreSQL 12+

---

## Project Structure

```
MyWorld/
├── frontend/
│   ├── src/
│   │   ├── components/     # Navbar, PostCard
│   │   ├── pages/          # Feed, Profile, Login, Connections, Groups, Marketplace
│   │   ├── graphql/        # GraphQL operations (queries, mutations, subscriptions)
│   │   └── lib/            # Apollo Client setup
│   └── .env.example
├── backend/
│   ├── graphql/            # Schema, resolvers, pubsub, context
│   ├── routes/             # REST routes (backward compatible)
│   ├── controllers/        # REST controllers
│   ├── middleware/         # JWT auth
│   └── .env.example
├── database/
│   ├── schema.sql
│   ├── seed.sql
│   └── migrations/
├── start.bat / start.sh
├── README.md
└── SETUP_GUIDE.md
```

---

## Prerequisites

- Node.js 18+
- PostgreSQL 12+
- npm

---

## Quick Start

### 1. Clone and set up the database

```bash
createdb myworld
psql -U postgres -d myworld -f database/schema.sql
psql -U postgres -d myworld -f database/seed.sql
```

**Seed accounts** (password for all: `password123`):

| Username | Email |
|----------|-------|
| john_doe | john@example.com |
| jane_smith | jane@example.com |
| bob_wilson | bob@example.com |

### 2. Configure backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Backend: **http://localhost:5000**  
GraphQL: **http://localhost:5000/graphql**

### 3. Configure frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend: **http://localhost:3000**

### 4. Or use the start script (Windows)

```bash
start.bat
```

---

## GraphQL API

### Endpoint
- **HTTP:** `POST http://localhost:5000/graphql`
- **WebSocket:** `ws://localhost:5000/graphql`

### Example

```graphql
mutation {
  login(email: "john@example.com", password: "password123") {
    token
    user { id username }
  }
}

query {
  posts {
    content
    likes
    likedByMe
    author { username }
  }
}

subscription {
  postCreated { content author { username } }
}
```

---

## Environment Variables

### Backend (`backend/.env`)

```
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=myworld
JWT_SECRET=change-this-to-a-long-random-string
```

### Frontend (`frontend/.env`)

```
VITE_GRAPHQL_URI=http://localhost:5000/graphql
VITE_GRAPHQL_WS_URI=ws://localhost:5000/graphql
```

---

## Architecture

```
React (Apollo Client)
    │  HTTP + WebSocket
    ▼
Express + Apollo Server (/graphql)
    └── PostgreSQL
```

---

## Security Notes

- Passwords hashed with bcrypt
- JWT expires after 24 hours
- Never commit `.env` files

---

## License

MIT — see [LICENSE](LICENSE)
