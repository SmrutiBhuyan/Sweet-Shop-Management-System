import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar, Nav, Container, Button, Badge } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';

// --- Define the Color Palette (Consistent with HomePage) ---
const COLORS = {
  emeraldGreen: '#008080', // Primary Navbar Background
  sandYellow: '#F4D090',   // Highlight color (text/buttons/accents)
  darkText: '#343a40',     // Dark text on light background
  lightText: '#ffffff',    // Light text on dark background
};

const NavigationBar = () => {
  const { user, logout, isAdmin } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <Navbar 
      expand="lg" 
      className="mb-4 shadow-sm"
      style={{ 
        backgroundColor: COLORS.emeraldGreen,
        // Using a dark variant for the text (although colors are set explicitly below)
        // variant="dark" is implicitly used by setting background color
      }}
    >
      <Container>
        {/* Brand/Logo */}
        <Navbar.Brand 
          as={Link} 
          to="/"
          style={{ 
            color: COLORS.lightText, 
            fontWeight: 'bold',
            fontSize: '1.5rem'
          }}
        >
          🍬 Sweet Shop Manager
        </Navbar.Brand>
        
        <Navbar.Toggle aria-controls="basic-navbar-nav" style={{ borderColor: COLORS.sandYellow }} />
        
        <Navbar.Collapse id="basic-navbar-nav">
          {/* Left Navigation Links */}
          <Nav className="me-auto">
            {/* Custom Link Style for better visibility */}
            <Nav.Link as={Link} to="/" style={{ color: COLORS.sandYellow, fontWeight: '600' }}>
              Home
            </Nav.Link>
            <Nav.Link as={Link} to="/dashboard" style={{ color: COLORS.sandYellow, fontWeight: '600' }}>
              Dashboard
            </Nav.Link>
            
            {isAdmin() && (
              <>
                <Nav.Link as={Link} to="/add-sweet" style={{ color: COLORS.sandYellow, fontWeight: '600' }}>
                  Add Sweet
                </Nav.Link>
                <Nav.Link as={Link} to="/admin" style={{ color: COLORS.sandYellow, fontWeight: '600' }}>
                  Admin Panel
                </Nav.Link>
              </>
            )}
          </Nav>
          
          {/* Right User/Auth Section */}
          <Nav className="align-items-center">
            {user ? (
              <>
                {/* User Info */}
                <Navbar.Text className="me-3" style={{ color: COLORS.lightText }}>
                  Welcome, <strong style={{ color: COLORS.sandYellow }}>{user.username}</strong>
                  {isAdmin() && (
                    <Badge bg="light" text="dark" className="ms-2" style={{ backgroundColor: COLORS.sandYellow }}>
                      Admin
                    </Badge>
                  )}
                </Navbar.Text>
                
                {/* Logout Button */}
                <Button 
                  variant="outline-light" 
                  onClick={handleLogout}
                  style={{ borderColor: COLORS.sandYellow, color: COLORS.sandYellow }}
                  // Add hover style for better UX
                  onMouseOver={(e) => { e.currentTarget.style.backgroundColor = COLORS.sandYellow; e.currentTarget.style.color = COLORS.darkText; }}
                  onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = COLORS.sandYellow; }}
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
                  className="me-2"
                  style={{ color: COLORS.sandYellow, fontWeight: '600' }}
                >
                  Login
                </Nav.Link>
                
                {/* Register Button (Using sandYellow as the "success" call to action) */}
                <Button 
                  as={Link} 
                  to="/register" 
                  style={{ backgroundColor: COLORS.sandYellow, borderColor: COLORS.sandYellow, color: COLORS.darkText, fontWeight: 'bold' }}
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