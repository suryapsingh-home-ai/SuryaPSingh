# Database Setup

## Fresh Install

```bash
createdb myworld
psql -U postgres -d myworld -f database/schema.sql
psql -U postgres -d myworld -f database/seed.sql
```

## Seed Data

All seed users use password: **`password123`**

| ID | Username | Email |
|----|----------|-------|
| 1 | john_doe | john@example.com |
| 2 | jane_smith | jane@example.com |
| 3 | bob_wilson | bob@example.com |

Sample posts, comments, likes, and friendships are included.

## Tables

- **users** — accounts and bios
- **posts**, **comments**, **likes** — feed
- **friendships** — connections (with `requested_by` for pending requests)
- **groups**, **group_members**, **group_posts**, **group_post_comments**, **group_post_likes**
- **marketplace_listings**, **marketplace_offers**

## Migrations

| File | Purpose |
|------|---------|
| `migrations/001_add_requested_by.sql` | Add `requested_by` to friendships (upgrade path) |

## Reset Database

```bash
dropdb myworld
createdb myworld
psql -U postgres -d myworld -f database/schema.sql
psql -U postgres -d myworld -f database/seed.sql
```
