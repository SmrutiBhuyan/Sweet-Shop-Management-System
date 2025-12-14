import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from './contexts/AuthContext';
import { SweetProvider } from './contexts/SweetContext';

// Import components
import Navbar from './components/Navbar/Navbar';
import HomePage from './components/HomePage/HomePage';
import LoginPage from './components/LoginPage/LoginPage';
import RegisterPage from './components/Register/RegisterPage';
import DashboardPage from './components/Dashboard/DashboardPage';
import SweetDetailPage from './components/SweetDetails/SweetDetailPage';
import AddSweetPage from './components/AddSweet/AddSweetPage';
import EditSweetPage from './components/EditSweet/EditSweetPage';
import AdminPanel from './components/AdminPanel/AdminPanel';

// Import styles
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

// Private Route component to protect routes
const PrivateRoute = ({ children, requireAdmin = false }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');
  
  if (!token || !user) {
    return <Navigate to="/login" />;
  }
  
  if (requireAdmin && user.role !== 'admin') {
    return <Navigate to="/" />;
  }
  
  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <SweetProvider>
          <div className="App">
            <Navbar />
            
            <Container className="mt-4">
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/sweets/:id" element={<SweetDetailPage />} />
                
                {/* Protected routes */}
                <Route 
                  path="/dashboard" 
                  element={
                    <PrivateRoute>
                      <DashboardPage />
                    </PrivateRoute>
                  } 
                />
                
                {/* Admin-only routes */}
                <Route 
                  path="/add-sweet" 
                  element={
                    <PrivateRoute requireAdmin>
                      <AddSweetPage />
                    </PrivateRoute>
                  } 
                />
                
                <Route 
                  path="/edit-sweet/:id" 
                  element={
                    <PrivateRoute requireAdmin>
                      <EditSweetPage />
                    </PrivateRoute>
                  } 
                />
                
                <Route 
                  path="/admin" 
                  element={
                    <PrivateRoute requireAdmin>
                      <AdminPanel />
                    </PrivateRoute>
                  } 
                />
                
                {/* Catch-all route */}
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </Container>
            
            <ToastContainer position="top-right" autoClose={3000} />
          </div>
        </SweetProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;