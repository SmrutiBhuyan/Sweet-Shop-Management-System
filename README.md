# 🍬 Sweet Shop Management System

A full-stack sweet shop management system built with React, Node.js, Express, and MongoDB following Test-Driven Development (TDD) principles.

## 🎯 Features

### Backend (Node.js/Express)
- RESTful API with JWT authentication
- MongoDB database with Mongoose ODM
- Role-based access control (Admin/Customer)
- Comprehensive API endpoints for sweet management
- Inventory tracking (purchase/restock)

### Frontend (React)
- Modern, responsive UI with React
- User authentication (register/login)
- Sweet browsing with search & filter
- Shopping cart functionality
- Admin dashboard for inventory management

### Development Practices
- ✅ Test-Driven Development (TDD)
- ✅ Clean code with descriptive naming
- ✅ Git with meaningful commit messages
- ✅ AI-assisted development with transparency

## 🛠 Tech Stack

### Backend
- Node.js with Express
- MongoDB with Mongoose
- JWT for authentication
- Jest for testing

### Frontend
- React with Vite
- React Router for navigation
- React Query for API state
- Tailwind CSS for styling
- React Testing Library

## 📁 Project Structure
sweet-shop-management-system/
├── backend/ # Express API server
├── frontend/ # React application
├── docs/ # Documentation
└── scripts/ # Build/deployment scripts


## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation
1. Clone the repository
2. Install dependencies: `npm run install:all`
3. Set up environment variables (see `.env.example`)
4. Start development servers: `npm run dev`

### Environment Variables
Create `.env` files in both backend and frontend directories:
- Backend: `backend/.env`
- Frontend: `frontend/.env`

## 🧪 Testing

Run tests:
```bash
# All tests
npm test

# Backend only
npm run test:backend

# Frontend only
npm run test:frontend

🤖 AI Usage
This project was developed with AI assistance. See AI_USAGE.md for detailed information about how AI tools were used throughout development.