# MyWorld Database Setup

## Overview
PostgreSQL database schema for the MyWorld social media application.

## Tables

### users
- Stores user account information
- Fields: id, username, email, password, bio, created_at, updated_at

### posts
- Stores user posts
- Fields: id, user_id, content, created_at, updated_at

### comments
- Stores comments on posts
- Fields: id, post_id, user_id, content, created_at, updated_at

### likes
- Stores post likes
- Fields: id, post_id, user_id, created_at

### friendships
- Stores friend connections between users
- Fields: id, user_id_1, user_id_2, status (pending/accepted), created_at, updated_at

## Setup Instructions

1. Create a PostgreSQL database:
   ```
   createdb myworld
   ```

2. Run the schema file:
   ```
   psql -U postgres -d myworld -f schema.sql
   ```

3. (Optional) Load sample data:
   ```
   psql -U postgres -d myworld -f seed.sql
   ```

4. Update backend `.env` file with your database credentials

## Configuration

Update your `.env` file in the backend folder:
```
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=myworld
```
