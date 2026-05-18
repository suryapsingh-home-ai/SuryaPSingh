# SETUP_GUIDE.md

## Quick Start Guide for MyWorld Social Media Application

### 📦 What's Included

Your MyWorld project includes a complete full-stack social media application with:

✅ **React Frontend** with Vite - Modern UI with routing, forms, and state management
✅ **Node.js Backend** with Express - REST API with authentication and CRUD operations  
✅ **PostgreSQL Database** - Complete schema with users, posts, comments, likes, and friendships
✅ **JWT Authentication** - Secure user authentication with tokens
✅ **Complete Documentation** - Setup guides and API reference

### 🚀 Quick Start (Windows)

1. **Set up the database:**
   ```
   createdb myworld
   psql -U postgres -d myworld -f database/schema.sql
   ```

2. **Configure backend (.env):**
   - Copy `backend/.env.example` to `backend/.env`
   - Update database credentials if needed

3. **Run the application:**
   - **Option A (Windows)**: Double-click `start.bat`
   - **Option B (Manual)**: 
     - Terminal 1: `cd backend && npm install && npm run dev`
     - Terminal 2: `cd frontend && npm install && npm run dev`

4. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5000

### 📁 Project Structure

```
MyWorld/
├── frontend/              # React + Vite application
│   ├── src/components/   # Reusable UI components
│   ├── src/pages/        # Page components (Feed, Profile, Auth)
│   └── package.json      # Frontend dependencies
│
├── backend/              # Node.js + Express API
│   ├── routes/           # API endpoints
│   ├── middleware/       # JWT authentication
│   └── package.json      # Backend dependencies
│
├── database/             # PostgreSQL setup
│   ├── schema.sql        # Database tables and schema
│   └── seed.sql          # Sample data
│
└── README.md             # Full documentation
```

### 🔑 Key Features Implemented

1. **User Management**
   - Register new accounts
   - Login with JWT authentication
   - View user profiles

2. **Posts & Engagement**
   - Create posts
   - Delete own posts
   - Like/unlike posts
   - Comment on posts

3. **Social Features**
   - User profiles with post history
   - Comment threads on posts
   - Like counter on posts

### 🔄 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /auth/register | Create new account |
| POST | /auth/login | User login |
| GET | /auth/profile | Get current user |
| GET | /posts | Get all posts |
| POST | /posts | Create post |
| DELETE | /posts/:id | Delete post |
| POST | /posts/:id/like | Like/unlike post |
| POST | /posts/:id/comments | Add comment |
| GET | /users/:id | Get user profile |
| GET | /users/:id/posts | Get user posts |

### 💻 Frontend Components

- **Navbar** - Navigation with user menu and logout
- **Feed** - Main page showing all posts
- **PostCreate** - Form to create new posts
- **Post** - Individual post with comments and likes
- **Profile** - User profile with post history
- **Login/Register** - Authentication pages

### ⚙️ Backend Routes

- **auth.js** - User authentication (register, login, profile)
- **posts.js** - Post CRUD and engagement (likes, comments)
- **users.js** - User profiles and user-specific posts

### 🗄️ Database Tables

1. **users** - User accounts and profiles
2. **posts** - User-created posts
3. **comments** - Post comments
4. **likes** - Post likes
5. **friendships** - Friend connections (future use)

### 🔒 Security Features

- Passwords hashed with bcryptjs
- JWT token-based authentication
- Protected API endpoints
- CORS configured for frontend

### 📝 Environment Variables

**Backend (.env):**
```
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=myworld
JWT_SECRET=your-secret-key-change-this
```

### 🛠️ Next Steps

1. Install dependencies: `npm install` in both frontend and backend folders
2. Set up PostgreSQL database using schema.sql
3. Configure .env file with your database credentials
4. Start the development servers
5. Test the application at localhost:3000

### 📚 Additional Resources

- See [README.md](README.md) for complete documentation
- See [database/README.md](database/README.md) for database setup details
- Frontend runs on port 3000, backend on port 5000
- API proxy is configured in vite.config.js

### ❓ Troubleshooting

**Database connection error:**
- Ensure PostgreSQL is running
- Verify credentials in .env match your setup

**Port already in use:**
- Change PORT in .env or update Vite config

**CORS errors:**
- Verify backend is running on http://localhost:5000
- Check CORS settings in server.js

### 🎯 Future Enhancements

- Real-time updates with WebSockets
- Image uploads for posts and profiles
- Direct messaging system
- Search functionality
- User recommendations
- Notifications system

---

**Your MyWorld application is ready to develop! 🚀**
