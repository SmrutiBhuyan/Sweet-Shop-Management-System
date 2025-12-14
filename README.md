# 🍬 Sweet Shop Management System

A complete full-stack web application for managing a sweet shop business. This system allows customers to browse, search, and purchase sweets, while administrators can manage inventory, add/edit/delete sweets, and track sales.

## 📋 Table of Contents

- [Features](#-features)
- [Prerequisites](#-prerequisites)
- [Installation Guide](#-installation-guide)
- [Configuration](#-configuration)
- [Running the Application](#-running-the-application)
- [Testing](#-testing)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Troubleshooting](#-troubleshooting)
- [Support](#-support)

## ✨ Features

### For Customers
- **User Registration & Login**: Create an account and securely log in
- **Browse Sweets**: View all available sweets with beautiful images
- **Search & Filter**: Search sweets by name or filter by category and price range
- **Purchase Sweets**: Add sweets to cart and make purchases
- **View Details**: See detailed information about each sweet

### For Administrators
- **Admin Dashboard**: Complete control panel for managing the shop
- **Add Sweets**: Create new sweet items with images, descriptions, and pricing
- **Edit Sweets**: Update existing sweet information
- **Delete Sweets**: Remove sweets from inventory
- **Restock Inventory**: Increase quantity of existing sweets
- **View Analytics**: Monitor sales and inventory status

## 🔧 Prerequisites

Before you begin, make sure you have the following software installed on your computer:

### Required Software

1. **Node.js** (Version 18 or higher)
   - **What it is**: A JavaScript runtime that allows you to run JavaScript on your computer
   - **How to install**: 
     - Visit [https://nodejs.org/](https://nodejs.org/)
     - Download the LTS (Long Term Support) version
     - Run the installer and follow the instructions
     - Verify installation by opening a terminal/command prompt and typing: `node --version`
   - **Why you need it**: Both the frontend and backend of this application run on Node.js

2. **MongoDB** (Version 6.0 or higher)
   - **What it is**: A database that stores all your application data (users, sweets, purchases, etc.)
   - **How to install**:
     - **Option A - Local Installation**:
       - Visit [https://www.mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
       - Download MongoDB Community Server for your operating system
       - Run the installer and follow the instructions
       - On Windows: MongoDB usually starts automatically as a service
       - On Mac/Linux: You may need to start it manually with `mongod` command
     - **Option B - MongoDB Atlas (Cloud - Recommended for beginners)**:
       - Visit [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
       - Create a free account
       - Create a free cluster (takes a few minutes)
       - Get your connection string (we'll use this later)
   - **Why you need it**: All your application data is stored in MongoDB

3. **Git** (Optional but recommended)
   - **What it is**: Version control system
   - **How to install**: Visit [https://git-scm.com/downloads](https://git-scm.com/downloads)
   - **Why you need it**: To clone/download the project code

4. **Code Editor** (Recommended: Visual Studio Code)
   - **What it is**: A program to edit code files
   - **How to install**: Visit [https://code.visualstudio.com/](https://code.visualstudio.com/)
   - **Why you need it**: To view and edit the project files

### Verify Your Installation

Open a terminal (Command Prompt on Windows, Terminal on Mac/Linux) and run these commands to verify everything is installed:

```bash
node --version    # Should show v18.x.x or higher
npm --version     # Should show 9.x.x or higher (comes with Node.js)
mongod --version  # Should show MongoDB version (if installed locally)
```

## 📦 Installation Guide

Follow these steps carefully to set up the project on your computer.

### Step 1: Download the Project

**Option A - Using Git (Recommended)**
```bash
# Open terminal/command prompt and navigate to where you want the project
cd Desktop  # or any folder you prefer

# Clone the repository
git clone <repository-url>
cd "Sweet Shop Management System"
```

**Option B - Download as ZIP**
1. Download the project as a ZIP file
2. Extract it to a folder (e.g., Desktop)
3. Open terminal/command prompt
4. Navigate to the extracted folder:
   ```bash
   cd Desktop
   cd "Sweet Shop Management System"
   ```

### Step 2: Install Backend Dependencies

The backend is the server that handles all the business logic and database operations.

```bash
# Navigate to the backend folder
cd backend

# Install all required packages (this may take 2-5 minutes)
npm install

# Wait for installation to complete
# You should see "added X packages" message when done
```

**What this does**: Downloads all the code libraries (packages) that the backend needs to run, such as Express (web framework), MongoDB driver, authentication libraries, etc.

### Step 3: Install Frontend Dependencies

The frontend is the user interface that users interact with in their web browser.

```bash
# Navigate to the frontend folder (from project root)
cd ../frontend

# Install all required packages (this may take 3-5 minutes)
npm install

# Wait for installation to complete
```

**What this does**: Downloads all the code libraries that the frontend needs, such as React (UI framework), routing, form handling, etc.

### Step 4: Set Up Environment Variables

Environment variables are configuration settings that tell the application how to connect to the database and what settings to use.

#### Backend Configuration

1. Navigate to the backend folder:
   ```bash
   cd backend
   ```

2. Create a file named `.env` in the `backend` folder:
   - **Windows**: Right-click in the backend folder → New → Text Document → Name it `.env` (make sure to remove .txt extension)
   - **Mac/Linux**: Use terminal: `touch .env`

3. Open the `.env` file in a text editor and add the following content:

   **For Local MongoDB:**
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # MongoDB Connection (Local)
   MONGODB_URI=mongodb://localhost:27017/sweet_shop

   # JWT Authentication
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRE=7d

   # Security
   BCRYPT_SALT_ROUNDS=10

   # CORS (Frontend URL)
   FRONTEND_URL=http://localhost:5173
   ```

   **For MongoDB Atlas (Cloud):**
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # MongoDB Connection (Atlas - Replace with your connection string)
   MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/sweet_shop?retryWrites=true&w=majority

   # JWT Authentication
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRE=7d

   # Security
   BCRYPT_SALT_ROUNDS=10

   # CORS (Frontend URL)
   FRONTEND_URL=http://localhost:5173
   ```

   **Important Notes:**
   - Replace `username` and `password` in the MongoDB Atlas connection string with your actual MongoDB Atlas credentials
   - Replace `cluster0.xxxxx.mongodb.net` with your actual cluster address
   - For `JWT_SECRET`, use a long random string. You can generate one online or use: `openssl rand -base64 32` (if you have OpenSSL installed)

#### Frontend Configuration

1. Navigate to the frontend folder:
   ```bash
   cd frontend
   ```

2. Create a file named `.env` in the `frontend` folder (same process as above)

3. Open the `.env` file and add:
   ```env
   # Backend API URL
   VITE_API_URL=http://localhost:5000/api
   ```

   **Note**: If your backend runs on a different port, change `5000` to that port number.

### Step 5: Start MongoDB (If Using Local Installation)

**Windows:**
- MongoDB usually runs automatically as a Windows service
- To check if it's running, open Services (Win + R → type `services.msc` → look for "MongoDB")
- If not running, right-click MongoDB service → Start

**Mac/Linux:**
```bash
# Start MongoDB service
mongod

# Or if installed via Homebrew (Mac)
brew services start mongodb-community
```

**Verify MongoDB is Running:**
```bash
# Open a new terminal and run
mongosh

# If you see "Current Mongosh log ID: ...", MongoDB is running
# Type 'exit' to leave mongosh
```

**For MongoDB Atlas Users**: You don't need to do anything - it's already running in the cloud!

## 🚀 Running the Application

Now that everything is set up, let's start the application!

### Method 1: Run Both Servers Together (Recommended)

Open a terminal in the project root folder and run:

```bash
# Make sure you're in the project root folder
# (Not in backend or frontend, but the main "Sweet Shop Management System" folder)

# Start both backend and frontend
npm run dev
```

This will start both servers. You should see:
- Backend server starting on port 5000
- Frontend server starting on port 5173

### Method 2: Run Servers Separately

If Method 1 doesn't work, you can run them in separate terminal windows:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

You should see:
```
✅ Successfully connected to MongoDB database
🚀 Server running on port 5000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

You should see:
```
  VITE v7.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### Access the Application

Once both servers are running:

1. **Open your web browser** (Chrome, Firefox, Safari, or Edge)
2. **Navigate to**: `http://localhost:5173`
3. You should see the Sweet Shop Management System homepage!

### First Time Setup - Create an Admin Account

1. Click on **"Register"** in the navigation bar
2. Fill in the registration form:
   - **Username**: Choose a username (e.g., "admin")
   - **Email**: Your email address
   - **Password**: Choose a secure password
   - **Role**: Select **"Admin"** from the dropdown
3. Click **"Register"**
4. You'll be automatically logged in as an admin
5. Now you can add sweets, manage inventory, etc.

### Create a Customer Account

1. Click on **"Register"** (or logout if you're logged in)
2. Fill in the registration form:
   - **Username**: Choose a username
   - **Email**: Your email address
   - **Password**: Choose a password
   - **Role**: Select **"Customer"**
3. Click **"Register"**
4. Now you can browse and purchase sweets!

## 🧪 Testing

The project includes comprehensive tests to ensure everything works correctly.

### Run All Tests

```bash
# From the project root
cd backend
npm test
```

### Run Specific Test Suites

```bash
# Unit tests (fast)
npm run test:unit

# Integration tests
npm run test:integration

# Security tests
npm run test:security

# All tests with coverage report
npm run test:coverage
```

### View Test Coverage

After running tests with coverage, open the coverage report:
```bash
cd backend
npm run test:coverage

# The report will be in backend/coverage/index.html
# Open it in your browser to see detailed coverage
```

## 📁 Project Structure

Understanding the project structure helps you navigate and understand the codebase:

```
Sweet Shop Management System/
│
├── backend/                    # Backend API Server
│   ├── src/
│   │   ├── config/            # Database configuration
│   │   │   └── database.js     # MongoDB connection setup
│   │   │
│   │   ├── controllers/       # Request handlers (business logic)
│   │   │   ├── authController.js    # Login, register, user management
│   │   │   ├── sweetController.js   # Sweet CRUD operations
│   │   │   └── purchaseController.js # Purchase handling
│   │   │
│   │   ├── middleware/        # Middleware functions
│   │   │   ├── auth.js         # Authentication & authorization
│   │   │   ├── validation.js   # Input validation
│   │   │   └── upload.js       # File upload handling
│   │   │
│   │   ├── models/            # Database models (schemas)
│   │   │   ├── User.js         # User model
│   │   │   ├── Sweet.js        # Sweet model
│   │   │   └── Purchase.js     # Purchase model
│   │   │
│   │   ├── routes/             # API routes
│   │   │   ├── authRoutes.js   # Authentication routes
│   │   │   ├── sweetRoutes.js  # Sweet management routes
│   │   │   └── purchaseRoutes.js # Purchase routes
│   │   │
│   │   ├── tests/              # Test files
│   │   │   ├── UserModel.test.js
│   │   │   ├── SweetModel.test.js
│   │   │   ├── validation.test.js
│   │   │   └── ... (more test files)
│   │   │
│   │   ├── utils/              # Utility functions
│   │   │   └── seedData.js     # Database seeding script
│   │   │
│   │   └── app.js              # Main Express application
│   │
│   ├── uploads/                # Uploaded images storage
│   ├── .env                    # Environment variables (you create this)
│   ├── .env.test               # Test environment variables
│   ├── package.json           # Backend dependencies
│   └── jest.config.js          # Jest test configuration
│
├── frontend/                   # React Frontend Application
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── HomePage/       # Homepage component
│   │   │   ├── LoginPage/      # Login component
│   │   │   ├── Register/       # Registration component
│   │   │   ├── Dashboard/      # User dashboard
│   │   │   ├── AdminPanel/     # Admin management panel
│   │   │   ├── AddSweet/       # Add sweet form
│   │   │   ├── EditSweet/      # Edit sweet form
│   │   │   ├── SweetDetails/   # Sweet detail page
│   │   │   └── Navbar/         # Navigation bar
│   │   │
│   │   ├── contexts/           # React Context (state management)
│   │   │   ├── AuthContext.jsx # Authentication state
│   │   │   └── SweetContext.jsx # Sweet data state
│   │   │
│   │   ├── services/           # API service functions
│   │   │   └── api.jsx         # API calls to backend
│   │   │
│   │   ├── utils/              # Utility functions
│   │   │   └── imageUtils.js   # Image handling utilities
│   │   │
│   │   ├── App.jsx             # Main app component
│   │   └── main.jsx            # Application entry point
│   │
│   ├── public/                 # Static files
│   ├── .env                    # Frontend environment variables
│   ├── package.json           # Frontend dependencies
│   └── vite.config.js          # Vite build configuration
│
├── .gitignore                  # Files to ignore in Git
├── package.json                # Root package.json (if any)
└── README.md                   # This file
```

## 📚 API Documentation

The backend provides a RESTful API. Here are the main endpoints:

### Authentication Endpoints

#### Register a New User
```
POST /api/auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "customer"  // or "admin"
}
```

#### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

Response includes a JWT token for authentication
```

#### Get Current User
```
GET /api/auth/me
Authorization: Bearer <your-jwt-token>
```

### Sweet Endpoints (All require authentication)

#### Get All Sweets
```
GET /api/sweets
Authorization: Bearer <token>

Query Parameters (optional):
- page: Page number (default: 1)
- limit: Items per page (default: 10)
- category: Filter by category
- minPrice: Minimum price
- maxPrice: Maximum price
```

#### Search Sweets
```
GET /api/sweets/search?query=chocolate&minPrice=10&maxPrice=50
Authorization: Bearer <token>
```

#### Get Sweet by ID
```
GET /api/sweets/:id
Authorization: Bearer <token>
```

#### Purchase a Sweet
```
POST /api/sweets/:id/purchase
Authorization: Bearer <token>
Content-Type: application/json

{
  "quantity": 2
}
```

### Admin-Only Endpoints

#### Create a Sweet
```
POST /api/sweets
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "name": "Chocolate Bar",
  "description": "Delicious milk chocolate",
  "category": "Chocolate",
  "price": 2.99,
  "quantity": 50
}
```

#### Update a Sweet
```
PUT /api/sweets/:id
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "name": "Updated Name",
  "price": 3.99,
  ...
}
```

#### Delete a Sweet
```
DELETE /api/sweets/:id
Authorization: Bearer <admin-token>
```

#### Restock a Sweet
```
POST /api/sweets/:id/restock
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "quantity": 20  // Adds 20 to current quantity
}
```

### Example API Usage with cURL

```bash
# Register a user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123","role":"customer"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get all sweets (replace YOUR_TOKEN with actual token from login)
curl -X GET http://localhost:5000/api/sweets \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🔍 Troubleshooting

### Problem: "Cannot find module" error

**Solution:**
```bash
# Make sure you've installed dependencies
cd backend
npm install

cd ../frontend
npm install
```

### Problem: MongoDB connection error

**Symptoms:** Error message like "MongoServerError: connect ECONNREFUSED"

**Solutions:**
1. **If using local MongoDB:**
   - Make sure MongoDB is running
   - Check if MongoDB service is started (Windows: Services app)
   - Verify connection string in `.env` is correct: `mongodb://localhost:27017/sweet_shop`

2. **If using MongoDB Atlas:**
   - Verify your connection string is correct
   - Make sure your IP address is whitelisted in Atlas (Network Access)
   - Check your username and password are correct
   - Ensure the database name is included in the connection string

### Problem: Port already in use

**Symptoms:** Error like "Port 5000 is already in use"

**Solutions:**
1. **Change the port** in `backend/.env`:
   ```env
   PORT=5001  # Use a different port
   ```
   Then update `frontend/.env`:
   ```env
   VITE_API_URL=http://localhost:5001/api
   ```

2. **Or stop the process using the port:**
   - Windows: Open Task Manager → Find Node.js process → End Task
   - Mac/Linux: `lsof -ti:5000 | xargs kill`

### Problem: Frontend can't connect to backend

**Symptoms:** API calls fail, network errors in browser console

**Solutions:**
1. Make sure backend is running (check Terminal 1)
2. Verify `VITE_API_URL` in `frontend/.env` matches backend port
3. Check browser console for CORS errors
4. Ensure both servers are running

### Problem: "User not found" when trying to login

**Solutions:**
1. Make sure you registered the user first
2. Check if you're using the correct email (not username) for login
3. Verify the password is correct
4. Check MongoDB connection - data might not be saving

### Problem: Tests are failing

**Solutions:**
1. Make sure MongoDB is running (tests use a test database)
2. Check `backend/.env.test` exists and has correct configuration
3. Run tests with: `cd backend && npm test`
4. If specific test fails, check the error message for details

### Problem: Images not uploading

**Solutions:**
1. Check if `backend/uploads` folder exists (it should be created automatically)
2. Verify file size is under 5MB
3. Ensure file is an image (jpg, png, gif, webp)
4. Check browser console for errors

### Problem: Admin features not working

**Solutions:**
1. Make sure you registered with `role: "admin"`
2. Logout and login again to refresh your token
3. Check browser console for 403 (Forbidden) errors
4. Verify your JWT token includes admin role

## 🆘 Getting Help

If you encounter issues not covered here:

1. **Check the error messages** - They usually tell you what's wrong
2. **Check the browser console** (F12 → Console tab) for frontend errors
3. **Check the terminal** where the backend is running for server errors
4. **Verify all prerequisites** are installed correctly
5. **Check environment variables** are set correctly in `.env` files
6. **Restart both servers** - Sometimes a simple restart fixes issues

## 📝 Common Tasks

### Add Sample Data (Seed Database)

To populate your database with sample sweets:

```bash
cd backend
npm run seed
```

This will create sample sweets in your database.

### Reset Database

To clear all data and start fresh:

1. Connect to MongoDB:
   ```bash
   mongosh  # or use MongoDB Compass
   ```

2. Switch to your database:
   ```javascript
   use sweet_shop
   ```

3. Delete all collections:
   ```javascript
   db.users.deleteMany({})
   db.sweets.deleteMany({})
   db.purchases.deleteMany({})
   ```

### Change Port Numbers

**Backend Port:**
Edit `backend/.env`:
```env
PORT=5001  # Change to your desired port
```

**Frontend Port:**
Edit `frontend/vite.config.js`:
```javascript
server: {
  port: 3000  // Change to your desired port
}
```

Don't forget to update `frontend/.env` if you change backend port!

## 🎓 Learning Resources

If you're new to web development, here are some helpful resources:

- **Node.js**: [https://nodejs.org/en/docs/](https://nodejs.org/en/docs/)
- **Express.js**: [https://expressjs.com/en/starter/installing.html](https://expressjs.com/en/starter/installing.html)
- **React**: [https://react.dev/learn](https://react.dev/learn)
- **MongoDB**: [https://www.mongodb.com/docs/](https://www.mongodb.com/docs/)

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Built with Node.js, Express, React, and MongoDB
- Uses various open-source libraries and frameworks
- Thank you to all contributors and the open-source community

---

**Happy Coding! 🚀**

If you have any questions or need help, don't hesitate to reach out or check the troubleshooting section above.
