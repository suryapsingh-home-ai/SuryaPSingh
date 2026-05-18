# MyWorld - Social Media Application

A full-stack social media application similar to Facebook, built with React, Node.js, and PostgreSQL.

## 🎯 Features

- **User Authentication**: Register and login with JWT tokens
- **User Profiles**: View and manage user profiles with bio and post history
- **Posts**: Create, read, and delete posts
- **Comments**: Add comments to posts
- **Likes**: Like/unlike posts
- **Friendships**: Connect with other users (future enhancement)
- **Real-time Updates**: Feed updates (future enhancement)

## 🏗️ Project Structure

```
MyWorld/
├── frontend/              # React Vite application
│   ├── src/
│   │   ├── components/    # Reusable components (Navbar, Post, PostCreate)
│   │   ├── pages/         # Page components (Feed, Profile, Login, Register)
│   │   ├── App.jsx        # Main app component
│   │   └── index.css      # Global styles
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
├── backend/               # Node.js Express server
│   ├── routes/            # API routes (auth, posts, users)
│   ├── middleware/        # Authentication middleware
│   ├── db.js              # Database connection
│   ├── server.js          # Main server file
│   ├── package.json
│   └── .env.example
├── database/              # PostgreSQL schemas
│   ├── schema.sql         # Database schema
│   ├── seed.sql           # Sample data
│   └── README.md
└── README.md              # This file
```

## 🛠️ Tech Stack

### Frontend
- **React 18+** - UI library
- **Vite** - Build tool
- **React Router** - Routing
- **Axios** - HTTP client
- **CSS** - Styling

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **PostgreSQL** - Database
- **bcryptjs** - Password hashing
- **JWT** - Authentication
- **CORS** - Cross-origin requests

## 📋 Prerequisites

- Node.js v16+
- npm or yarn
- PostgreSQL 12+
- Git

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd MyWorld
```

### 2. Set Up PostgreSQL Database

```bash
# Create database
createdb myworld

# Run schema
psql -U postgres -d myworld -f database/schema.sql

# (Optional) Load sample data
psql -U postgres -d myworld -f database/seed.sql
```

### 3. Set Up Backend

```bash
cd backend

# Copy environment file
cp .env.example .env

# Update .env with your database credentials
# DB_HOST=localhost
# DB_PORT=5432
# DB_USER=postgres
# DB_PASSWORD=your_password
# DB_NAME=myworld
# JWT_SECRET=your-secret-key

# Install dependencies
npm install

# Start development server
npm run dev
```

The backend will run on `http://localhost:5000`

### 4. Set Up Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will run on `http://localhost:3000`

## 📚 API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `GET /auth/profile` - Get current user profile (requires token)

### Posts
- `GET /posts` - Get all posts
- `POST /posts` - Create new post
- `DELETE /posts/:postId` - Delete post
- `POST /posts/:postId/like` - Like/unlike post
- `POST /posts/:postId/comments` - Add comment to post

### Users
- `GET /users/:userId` - Get user profile
- `GET /users/:userId/posts` - Get user's posts

## 🔐 Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

Tokens are obtained from login/register and stored in localStorage on the frontend.

## 💻 Development

### Frontend Structure

- **pages/**: Full page components
  - `Feed.jsx` - Main feed showing all posts
  - `Profile.jsx` - User profile page
  - `Login.jsx` - Login page
  - `Register.jsx` - Registration page

- **components/**: Reusable components
  - `Navbar.jsx` - Navigation bar
  - `Post.jsx` - Single post with comments and likes
  - `PostCreate.jsx` - Post creation form

### Backend Structure

- **routes/**: API route handlers
  - `auth.js` - Authentication endpoints
  - `posts.js` - Post CRUD operations
  - `users.js` - User profile endpoints

- **middleware/**: Express middleware
  - `auth.js` - JWT verification middleware

## 🗄️ Database Schema

### Users Table
- id (PK)
- username (UNIQUE)
- email (UNIQUE)
- password (hashed)
- bio
- created_at, updated_at

### Posts Table
- id (PK)
- user_id (FK)
- content
- created_at, updated_at

### Comments Table
- id (PK)
- post_id (FK)
- user_id (FK)
- content
- created_at, updated_at

### Likes Table
- id (PK)
- post_id (FK)
- user_id (FK)
- created_at

### Friendships Table
- id (PK)
- user_id_1 (FK)
- user_id_2 (FK)
- status (pending/accepted)
- created_at, updated_at

## 🚦 Running Both Frontend & Backend

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Visit `http://localhost:3000` in your browser.

## 📝 Sample Test Account

After seeding the database:
- Username: `john_doe`
- Email: `john@example.com`
- Password: `password123` (change the hash in seed.sql)

## 🔄 Environment Variables

### Backend (.env)

```
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=myworld
JWT_SECRET=your-secret-key-change-this
```

### Frontend (vite.config.js)

Frontend API proxy is configured in `vite.config.js` to proxy requests to `/api` to `http://localhost:5000`.

## 🐛 Common Issues

1. **Database Connection Error**
   - Verify PostgreSQL is running
   - Check .env credentials match your setup
   - Ensure database exists

2. **CORS Errors**
   - Verify backend is running on port 5000
   - Check CORS middleware in server.js

3. **JWT Token Expired**
   - Clear localStorage and login again
   - Tokens expire after 24 hours

## 🎯 Future Enhancements

- [ ] Real-time notifications
- [ ] WebSocket support for live updates
- [ ] Image upload for posts and profiles
- [ ] Message/Chat system
- [ ] Search functionality
- [ ] Trending posts/hashtags
- [ ] User recommendations
- [ ] Post editing
- [ ] Emoji support
- [ ] Dark mode

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues for bugs and feature requests.

## 📧 Support

For support, please create an issue in the repository.

---

**Happy Coding! 🚀**
