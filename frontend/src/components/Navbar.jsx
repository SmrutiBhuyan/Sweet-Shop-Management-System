import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar, Nav, Container, Button, Badge } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';

const NavigationBar = () => {
  const { user, logout, isAdmin } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <Navbar bg="primary" variant="dark" expand="lg" className="mb-4">
      <Container>
        <Navbar.Brand as={Link} to="/">
          🍬 Sweet Shop Manager
        </Navbar.Brand>
        
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">Home</Nav.Link>
            <Nav.Link as={Link} to="/dashboard">Dashboard</Nav.Link>
            
            {isAdmin() && (
              <>
                <Nav.Link as={Link} to="/add-sweet">Add Sweet</Nav.Link>
                <Nav.Link as={Link} to="/admin">Admin Panel</Nav.Link>
              </>
            )}
          </Nav>
          
          <Nav className="align-items-center">
            {user ? (
              <>
                <Navbar.Text className="me-3">
                  Welcome, <strong>{user.username}</strong>
                  {isAdmin() && (
                    <Badge bg="warning" text="dark" className="ms-2">Admin</Badge>
                  )}
                </Navbar.Text>
                <Button 
                  variant="outline-light" 
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login" className="me-2">
                  Login
                </Nav.Link>
                <Button as={Link} to="/register" variant="success">
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