# MyWorld — Setup Guide

Quick reference for getting MyWorld running locally.

## What You Get

- React frontend with Apollo Client (GraphQL + subscriptions)
- Node.js backend with Apollo Server
- PostgreSQL database with seed data
- Social feed, profiles, connections, groups, marketplace

---

## Step-by-Step Setup

### 1. Database

```bash
createdb myworld
psql -U postgres -d myworld -f database/schema.sql
psql -U postgres -d myworld -f database/seed.sql
```

### 2. Backend

```bash
cd backend
copy .env.example .env        # Windows
# cp .env.example .env        # macOS/Linux
npm install
npm run dev
```

Verify: open http://localhost:5000/health  
GraphQL: http://localhost:5000/graphql

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000

### 4. Log in with seed data

- Email: `john@example.com`
- Password: `password123`

---

## Test GraphQL in Browser

1. Go to http://localhost:5000/graphql
2. Run login mutation to get a token
3. Add HTTP header: `{ "Authorization": "Bearer YOUR_TOKEN" }`
4. Run queries: `posts`, `connections`, `groups`

---

## Test Live Subscriptions

1. Open the feed in two browser tabs
2. Log in as different users (john / jane)
3. Create a post or like in one tab
4. Watch the other tab update without refresh

---

## Pages

| Route | Page |
|-------|------|
| `/login` | Login |
| `/register` | Register |
| `/` | Feed (live) |
| `/profile` | Your profile |
| `/profile/:userId` | View another user |
| `/connections` | Friends & requests |
| `/groups` | Groups |
| `/marketplace` | Marketplace |

---

## Upgrading an Existing Database

If you created the database before the `requested_by` column was added:

```bash
psql -U postgres -d myworld -f database/migrations/001_add_requested_by.sql
```

---

## Production Checklist (before publishing)

- [ ] Change `JWT_SECRET` in production
- [ ] Use strong PostgreSQL password
- [ ] Set `VITE_GRAPHQL_URI` to your deployed API URL
- [ ] Enable HTTPS and WSS in production
- [ ] Do not commit `.env` files

---

See [README.md](README.md) for full documentation.
