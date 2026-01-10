import React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { useNavigate } from 'react-router-dom';

import { styled } from '@mui/material/styles';

const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  padding: theme.spacing(0, 3),
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(0, 6),
  },
}));

const LogoText = styled(Typography)(({ theme }) => ({
  background: 'linear-gradient(45deg, #00d4ff, #ff00d4)',
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  fontWeight: 'bold',
  fontSize: '1.5rem',
  letterSpacing: '0.5px',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.05)',
  },
}));

const NavButton = styled(Button)(({ theme }) => ({
  color: 'rgba(255, 255, 255, 0.8)',
  fontWeight: '500',
  position: 'relative',
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: -2,
    left: '50%',
    transform: 'translateX(-50%)',
    width: 0,
    height: 2,
    background: 'linear-gradient(45deg, #00d4ff, #ff00d4)',
    transition: 'width 0.3s ease',
  },
  '&:hover': {
    color: '#ffffff',
    background: 'transparent',
    '&::after': {
      width: '80%',
    },
  },
}));

export default function MyAppBar() {
  const navigate = useNavigate();
  const isLoggedIn = Boolean(localStorage.getItem('token'));
  const role = localStorage.getItem('role');

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <Box sx={{ flexGrow: 1, mb: 2 }}>
      <AppBar position="static">
        <StyledToolbar>
          <LogoText
            variant="h6"
            component="div"
            onClick={() => navigate('/')}
            className="fade-in-up"
          >
            EXOSKELETON THERAPY
          </LogoText>
          
          {isLoggedIn && (
            <Box sx={{ display: 'flex', gap: 2 }} className="fade-in-up">
              <NavButton onClick={() => navigate('/profile')}>
                Profile
              </NavButton>
              
              {role === 'doctor' && (
                <NavButton onClick={() => navigate('/doctor')}>
                  Doctor Dashboard
                </NavButton>
              )}
              {role === 'doctor' && (
                <NavButton onClick={() => navigate('/exercises')}>
                  Exercises
                </NavButton>
              )}
              
              {role === 'patient' && (
                <NavButton onClick={() => navigate('/patient')}>
                  Patient Dashboard
                </NavButton>
              )}
              
              <NavButton 
                onClick={handleLogout}
                sx={{
                  '&::after': {
                    background: 'linear-gradient(45deg, #ff4444, #cc0000)',
                  }
                }}
              >
                Logout
              </NavButton>
            </Box>
          )}
          
          {!isLoggedIn && (
            <Box sx={{ display: 'flex', gap: 2 }} className="fade-in-up">
              <NavButton onClick={() => navigate('/login')}>
                Login
              </NavButton>
              
              <Button 
                variant="contained"
                onClick={() => navigate('/signup')}
                sx={{
                  background: 'linear-gradient(45deg, #00d4ff, #ff00d4)',
                  borderRadius: '12px',
                  padding: '8px 24px',
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #00d4ff, #ff00d4)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 20px rgba(0, 212, 255, 0.4)',
                  }
                }}
              >
                Sign Up
              </Button>
            </Box>
          )}
        </StyledToolbar>
      </AppBar>
    </Box>
  );
} 