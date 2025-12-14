# Setup Guide

## Environment Variables Setup

### Backend Environment Variables

Create a file named `.env` in the `backend/` directory with the following content:

```env
# MongoDB Database Connection
# For local MongoDB: mongodb://localhost:27017/sweet_shop
# For MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/sweet_shop
MONGODB_URI=mongodb://localhost:27017/sweet_shop

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT (JSON Web Token) Configuration
# Generate a strong random string for production (e.g., use: openssl rand -base64 32)
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=30d

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

### Frontend Environment Variables

Create a file named `.env` in the `frontend/` directory with the following content:

```env
# Backend API URL
# This is the URL where your backend server is running
VITE_API_URL=http://localhost:5000/api
```

## Quick Setup Commands

### Windows (PowerShell)
```powershell
# Backend .env
@"
MONGODB_URI=mongodb://localhost:27017/sweet_shop
PORT=5000
NODE_ENV=development
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=30d
FRONTEND_URL=http://localhost:5173
"@ | Out-File -FilePath backend\.env -Encoding utf8

# Frontend .env
@"
VITE_API_URL=http://localhost:5000/api
"@ | Out-File -FilePath frontend\.env -Encoding utf8
```

### macOS/Linux
```bash
# Backend .env
cat > backend/.env << EOF
MONGODB_URI=mongodb://localhost:27017/sweet_shop
PORT=5000
NODE_ENV=development
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=30d
FRONTEND_URL=http://localhost:5173
EOF

# Frontend .env
cat > frontend/.env << EOF
VITE_API_URL=http://localhost:5000/api
EOF
```

## MongoDB Setup

### Option 1: Local MongoDB

1. Download and install MongoDB from [mongodb.com](https://www.mongodb.com/try/download/community)
2. Start MongoDB service:
   - **Windows**: Usually starts automatically
   - **macOS**: `brew services start mongodb-community`
   - **Linux**: `sudo systemctl start mongod`
3. Use connection string: `mongodb://localhost:27017/sweet_shop`

### Option 2: MongoDB Atlas (Cloud)

1. Create a free account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Get your connection string from "Connect" → "Connect your application"
4. Replace `MONGODB_URI` in `backend/.env` with your Atlas connection string

## Installation Steps

1. **Install dependencies**
   ```bash
   npm run install:all
   ```

2. **Set up environment variables** (see above)

3. **Start MongoDB** (if using local installation)

4. **Run the application**
   ```bash
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running
- Check connection string format
- For Atlas: Ensure your IP is whitelisted

### Port Already in Use
- Change `PORT` in `backend/.env` to a different port
- Update `VITE_API_URL` in `frontend/.env` accordingly

### CORS Errors
- Ensure `FRONTEND_URL` in `backend/.env` matches your frontend URL
- Check that both servers are running

