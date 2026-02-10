# Tether - Unified Social Chat Application

A modern, full-stack application that merges real-time messaging with social media features into a single cohesive platform.

## 🎯 Features

### 💬 Messaging

- Create conversations with other users
- Send, edit, and delete messages in real-time
- View conversation history
- See when messages were sent

### 📱 Social Media

- Create and share posts with text and images
- Comment on posts made by other users
- Like/unlike posts
- View user profiles and post feeds
- Search and discover other users

### 🔐 Authentication

- Secure user registration and login
- JWT-based authentication
- Password hashing with bcrypt
- Protected routes and API endpoints

---

## 📚 Documentation

### Getting Started

- **[QUICK_START.md](./QUICK_START.md)** - Get the app running in 5 minutes

### Architecture & Setup

- **[INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)** - Complete architecture, schema, and API documentation
- **[CONSOLIDATION_SUMMARY.md](./CONSOLIDATION_SUMMARY.md)** - What changed from the original apps
- **[CONSOLIDATION_COMPLETE.md](./CONSOLIDATION_COMPLETE.md)** - Visual overview and summary

---

## 🛠️ Tech Stack

### Backend

- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **PostgreSQL** - Database
- **Prisma** - ORM and schema management
- **JWT** - Token-based authentication
- **Bcrypt** - Password hashing
- **Passport.js** - Authentication strategy

### Frontend

- **React** - UI library
- **Vite** - Build tool and dev server
- **React Router** - Navigation
- **Axios** - HTTP client
- **React Hot Toast** - Notifications

---

## 📂 Project Structure

```
tether-social/
├── backend/                  # Express server with all routes
│   ├── config/              # Auth, JWT, Passport, Prisma
│   ├── controllers/         # Business logic for all features
│   ├── middleware/          # JWT authentication middleware
│   ├── routes/              # API endpoints (auth, users, posts, messages, etc.)
│   ├── prisma/              # Database schema and migrations
│   └── server.js            # Express app entry point
│
├── frontend/                # React application (setup from tether)
│   └── src/
│       ├── components/      # Reusable UI components
│       ├── pages/           # Page components
│       ├── context/         # React context for state
│       ├── api/             # Axios configuration
│       └── App.jsx
│
└── Documentation files
    ├── QUICK_START.md
    ├── INTEGRATION_GUIDE.md
    ├── CONSOLIDATION_SUMMARY.md
    └── CONSOLIDATION_COMPLETE.md
```

---

## 🚀 Quick Start

### Backend

```bash
cd backend

# Install dependencies
npm install

# Configure environment
# Ensure .env has DATABASE_URL and JWT_SECRET

# Initialize database
npx prisma migrate dev

# Start server
npm run dev
# Server runs on http://localhost:3000
```

### Frontend

```bash
# Using existing tether/frontend
cd ../tether/frontend

# Update API URL
echo 'VITE_API_URL=http://localhost:3000/api' > .env.local

# Install and start
npm install
npm run dev
# Opens at http://localhost:5173
```

Or for a new unified frontend:

```bash
# TODO: Copy tether/frontend to tether-social/frontend
# Then run the same commands above
```

---

## 📡 API Routes

### Authentication

```
POST   /api/auth/register       Register new user
POST   /api/auth/login          Login and get JWT token
GET    /api/auth/me             Get current user (protected)
POST   /api/auth/logout         Logout (protected)
```

### Users

```
GET    /api/users               Search/list users
GET    /api/users/:id           Get user profile
PUT    /api/users/:id           Update profile (protected)
```

### Posts

```
POST   /api/posts               Create post (protected)
GET    /api/posts               List all posts
GET    /api/posts/:id           Get single post
PUT    /api/posts/:id           Update post (protected)
DELETE /api/posts/:id           Delete post (protected)
```

### Comments

```
POST   /api/comments            Create comment (protected)
GET    /api/comments/post/:id   List post comments
PUT    /api/comments/:id        Update comment (protected)
DELETE /api/comments/:id        Delete comment (protected)
```

### Likes

```
POST   /api/likes               Like a post (protected)
DELETE /api/likes               Unlike a post (protected)
GET    /api/likes/post/:id      Get post likes
```

### Conversations (Chat)

```
POST   /api/conversations       Create conversation (protected)
GET    /api/conversations       List conversations (protected)
```

### Messages (Chat)

```
POST   /api/messages            Send message (protected)
GET    /api/messages/:convId    Get messages (protected)
PUT    /api/messages/:id        Edit message (protected)
DELETE /api/messages/:id        Delete message (protected)
```

---

## 🗄️ Database Schema

### Models

- **User** - User accounts with profile info
- **Post** - Social media posts
- **Comment** - Comments on posts
- **Like** - Likes on posts
- **Conversation** - Chat conversations between users
- **Message** - Messages within conversations

See [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md) for full schema details.

---

## 📋 Environment Variables

### Backend (.env)

```
DATABASE_URL="postgresql://..."  # PostgreSQL connection
JWT_SECRET="your-secret-key"     # Token signing key
NODE_ENV="development"           # development or production
PORT=3000                        # Server port
```

### Frontend (.env.local)

```
VITE_API_URL=http://localhost:3000/api  # Backend API URL
```

---

## 🔐 Authentication

- **Register** - Create new account with username, email, password
- **Login** - Submit credentials to receive JWT token
- **Token Storage** - Token stored in localStorage on frontend
- **Protected Routes** - Endpoints require valid JWT in Authorization header
- **Timeout** - Tokens expire after 7 days

---

## 💾 Database

- **Provider** - PostgreSQL
- **ORM** - Prisma
- **Migrations** - Managed with Prisma migrations
- **Data** - Cascading deletes configured for data integrity

---

## 🧪 Testing the API

### Using cURL

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username":"testuser",
    "email":"test@example.com",
    "password":"password123",
    "confirmPassword":"password123"
  }'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test@example.com",
    "password":"password123"
  }'

# Create Post (use token from login)
curl -X POST http://localhost:3000/api/posts \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"content":"Hello, world!"}'
```

### Using Postman

1. Import endpoints from API route list above
2. Set Authorization header with JWT token
3. Send requests to http://localhost:3000/api/\*

---

<!-- ## 📖 Detailed Documentation

For comprehensive information, see:

- **[INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)** - Architecture, schema, and complete setup
- **[CONSOLIDATION_SUMMARY.md](./CONSOLIDATION_SUMMARY.md)** - What changed from original apps
- **[QUICK_START.md](./QUICK_START.md)** - 5-minute setup and testing guide
- **[CONSOLIDATION_COMPLETE.md](./CONSOLIDATION_COMPLETE.md)** - Visual diagrams and overview

--- -->

## 🛠️ Development

### Available Scripts

#### Backend

```bash
# Start development server
npm run dev

# Start production server
node server.js

# Initialize Prisma
npx prisma migrate dev
npx prisma generate
npx prisma studio   # Open data viewer
```

#### Frontend

```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run lint     # Check code quality
npm run preview  # Preview production build
```

---

## ⚠️ Important Notes

### Database

- Your apps share a single PostgreSQL database
- Prisma schema includes all models for both chat and social features
- Migrations are in `backend/prisma/migrations/`

### Authentication

- All passwords are hashed with bcrypt (never stored plain)
- JWT tokens are signed with JWT_SECRET
- Keep JWT_SECRET secure and consistent across environments

### Frontend Setup

- Currently using tether/frontend
- Can upgrade to unified tether-social/frontend later
- Just update VITE_API_URL to point to merged backend

---

## 🌐 Deployment

### Backend

1. Set environment variables on hosting platform
2. Install dependencies: `npm install`
3. Run migrations: `npx prisma migrate deploy`
4. Start server: `npm start`

### Frontend

1. Build for production: `npm run build`
2. Deploy `dist/` folder to static hosting (Netlify, Vercel, AWS S3, etc.)
3. Set VITE_API_URL to production backend URL

---

## 🐛 Troubleshooting

### Database Connection Error

- Verify DATABASE_URL in .env
- Check PostgreSQL is running
- Ensure network can reach database server

### Authorization Error (401)

- Verify JWT_SECRET matches between environments
- Ensure token is being sent in request headers
- Check token hasn't expired

### CORS Error

- Update CORS origin in server.js if needed
- Ensure VITE_API_URL is correct in frontend

### Prisma Errors

- Run `npx prisma generate` to regenerate client
- Run `npx prisma db push` to sync schema with database
- Run `npx prisma migrate dev` to apply pending migrations

---

## 📞 Support

For issues or questions:

1. Check the detailed documentation files
2. Review error messages in console/logs
3. Verify environment configuration
4. Check API endpoint list for correct routes

---

## 📝 License

This is a personal project for learning and development.

---
