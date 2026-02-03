import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Card, CardContent, Typography, TextField, Button, Box, Alert, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';



const StyledForm = styled('form')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(3),
}));

const AnimatedContainer = styled(Container)(({ theme }) => ({
  animation: 'fadeInUp 0.6s ease-out forwards',
}));

const GlassCard = styled(Card)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(20px)',
  borderRadius: '24px',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
  padding: theme.spacing(4),
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4)',
    borderColor: 'rgba(0, 212, 255, 0.2)',
  },
}));

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axios.post('http://127.0.0.1:5000/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', res.data.role);
      if (res.data.role === 'doctor') {
        navigate('/doctor');
      } else {
        navigate('/patient');
      }
    } catch (err) {
      setError('Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box 
      sx={{ 
        minHeight: 'calc(100vh - 64px)', // Account for AppBar
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        py: 4
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: '10%',
          left: '10%',
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle at center, rgba(0, 212, 255, 0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          animation: 'backgroundShift 15s ease-in-out infinite',
          filter: 'blur(40px)',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '10%',
          right: '10%',
          width: '250px',
          height: '250px',
          background: 'radial-gradient(circle at center, rgba(255, 0, 212, 0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          animation: 'backgroundShift 20s ease-in-out infinite reverse',
          filter: 'blur(40px)',
        }}
      />

      <AnimatedContainer maxWidth="sm">
        <GlassCard>
          <CardContent>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography 
                variant="h3" 
                sx={{ 
                  fontWeight: 800,
                  mb: 1,
                  background: 'linear-gradient(45deg, #00d4ff, #ff00d4)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                EXOSKELETON
              </Typography>
              <Typography 
                variant="h6" 
                sx={{ 
                  color: 'text.secondary',
                  fontWeight: 400,
                  letterSpacing: '0.5px',
                }}
              >
                Therapy Management System
              </Typography>
            </Box>

            <StyledForm onSubmit={handleSubmit}>
              <TextField 
                label="Email" 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                required 
                fullWidth
                className="futuristic-input"
                InputLabelProps={{
                  style: { color: 'rgba(0, 0, 0, 0.7)' }
                }}
                InputProps={{
                  style: { 
                    color: 'black',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)'
                  }
                }}
              />
              
              <TextField 
                label="Password" 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                required 
                fullWidth
                className="futuristic-input"
                InputLabelProps={{
                  style: { color: 'rgba(0, 0, 0, 0.7)' }
                }}
                InputProps={{
                  style: { 
                    color: 'black',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)'
                  }
                }}
              />
              
              <Button 
                type="submit" 
                variant="contained" 
                className="futuristic-btn neon-accent"
                disabled={loading}
                style={{
                  padding: '15px',
                  fontSize: '18px',
                  fontWeight: '600',
                  marginTop: '10px',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {loading ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="loading-spinner" style={{ width: '20px', height: '20px', marginRight: '10px' }} />
                    Authenticating...
                  </div>
                ) : (
                  'LOGIN'
                )}
              </Button>
            </Box>

            {error && (
              <Alert 
                severity="error" 
                style={{ 
                  marginTop: '20px',
                  background: 'rgba(255, 68, 68, 0.1)',
                  border: '1px solid rgba(255, 68, 68, 0.3)',
                  color: '#ff4444'
                }}
              >
                {error}
              </Alert>
            )}

            <Typography style={{ 
              marginTop: '30px', 
              textAlign: 'center',
              color: 'rgba(255, 255, 255, 0.7)'
            }}>
              Don't have an account? 
              <Button 
                onClick={() => navigate('/signup')}
                style={{
                  color: '#00d4ff',
                  fontWeight: '600',
                  textTransform: 'none',
                  marginLeft: '5px'
                }}
              >
                Sign up
              </Button>
            </Typography>
          </CardContent>
        </GlassCard>
      </AnimatedContainer>
    </Box>
  );


export default Login; 