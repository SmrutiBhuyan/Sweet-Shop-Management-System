import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar, Nav, Container, Button, Badge } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';
import './Navbar.css';

const NavigationBar = () => {
  const { user, logout, isAdmin } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <Navbar expand="lg" className="custom-navbar">
      <Container>
        {/* Brand/Logo */}
        <Navbar.Brand as={Link} to="/" className="navbar-brand">
          🍬 Sweet Shop Manager
        </Navbar.Brand>
        
        <Navbar.Toggle aria-controls="navbar-nav" className="navbar-toggler" />
        
        <Navbar.Collapse id="navbar-nav">
          {/* Left Navigation Links */}
          <Nav className="nav-links">
            <Nav.Link as={Link} to="/" className="nav-link">
              Home
            </Nav.Link>
            <Nav.Link as={Link} to="/dashboard" className="nav-link">
              Dashboard
            </Nav.Link>
            
            {isAdmin() && (
              <>
                <Nav.Link as={Link} to="/add-sweet" className="nav-link">
                  Add Sweet
                </Nav.Link>
                <Nav.Link as={Link} to="/admin" className="nav-link">
                  Admin Panel
                </Nav.Link>
              </>
            )}
          </Nav>
          
          {/* Right User/Auth Section */}
          <Nav className="user-nav">
            {user ? (
              <>
                {/* User Info */}
                <div className="user-info">
                  <span className="welcome-text">
                    Welcome, <strong className="username">{user.username}</strong>
                  </span>
                  {isAdmin() && (
                    <Badge className="admin-badge">
                      Admin
                    </Badge>
                  )}
                </div>
                
                {/* Logout Button */}
                <Button 
                  variant="outline-light" 
                  onClick={handleLogout}
                  className="logout-btn"
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                {/* Login Link */}
                <Nav.Link 
                  as={Link} 
                  to="/login" 
                  className="login-link"
                >
                  Login
                </Nav.Link>
                
                {/* Register Button */}
                <Button 
                  as={Link} 
                  to="/register" 
                  className="register-btn"
                >
                  Register
                </Button>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavigationBar;