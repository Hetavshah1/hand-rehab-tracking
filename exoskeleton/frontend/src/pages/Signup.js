import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Card, CardContent, Typography, TextField, Button, Box, Alert, MenuItem, FormControl, InputLabel, Select } from '@mui/material';

function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('patient');
  const [age, setAge] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = { name, email, password, role };
      if (role === 'patient') payload.age = age;
      await axios.post('http://127.0.0.1:5000/signup', payload);
      navigate('/login');
    } catch (err) {
      setError('Signup failed. Try a different email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
      padding: '20px'
    }}>
      {/* Professional Background Pattern */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: `
          radial-gradient(circle at 25% 25%, rgba(0, 212, 255, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 75% 75%, rgba(255, 0, 212, 0.1) 0%, transparent 50%),
          linear-gradient(135deg, rgba(0, 0, 0, 0.9) 0%, rgba(26, 26, 46, 0.95) 100%)
        `,
        zIndex: 1
      }} />

      {/* Grid Pattern Overlay */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundImage: `
          linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
        `,
        backgroundSize: '50px 50px',
        zIndex: 2
      }} />

      <Container maxWidth="md" style={{ position: 'relative', zIndex: 3 }}>
        <div className="glass-card" style={{ padding: '50px' }}>
          <CardContent style={{ padding: 0 }}>
            {/* Professional Header */}
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
              <Typography 
                variant="h3" 
                className="animated-text"
                style={{ 
                  fontWeight: '700',
                  marginBottom: '15px',
                  fontSize: '2.8rem',
                  letterSpacing: '2px'
                }}
              >
                JOIN THE FUTURE
              </Typography>
              <Typography 
                variant="h6" 
                style={{ 
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontWeight: '300',
                  fontSize: '1.1rem',
                  letterSpacing: '1px'
                }}
              >
                Advanced Exoskeleton Therapy Platform
              </Typography>
              <div style={{
                width: '100px',
                height: '3px',
                background: 'linear-gradient(90deg, #00d4ff, #ff00d4)',
                margin: '20px auto',
                borderRadius: '2px'
              }} />
            </div>

            {/* Professional Form */}
            <Box component="form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <TextField 
                  label="Full Name" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  required 
                  fullWidth
                  className="futuristic-input"
                  InputLabelProps={{
                    style: { color: 'rgba(0, 0, 0, 0.7)', fontWeight: '500' }
                  }}
                  InputProps={{
                    style: { 
                      color: 'black', 
                      fontSize: '16px',
                      backgroundColor: 'rgba(255, 255, 255, 0.9)'
                    }
                  }}
                />
                
                <TextField 
                  label="Email Address" 
                  type="email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  required 
                  fullWidth
                  className="futuristic-input"
                  InputLabelProps={{
                    style: { color: 'rgba(0, 0, 0, 0.7)', fontWeight: '500' }
                  }}
                  InputProps={{
                    style: { 
                      color: 'black', 
                      fontSize: '16px',
                      backgroundColor: 'rgba(255, 255, 255, 0.9)'
                    }
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <TextField 
                  label="Password" 
                  type="password" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  required 
                  fullWidth
                  className="futuristic-input"
                  InputLabelProps={{
                    style: { color: 'rgba(0, 0, 0, 0.7)', fontWeight: '500' }
                  }}
                  InputProps={{
                    style: { 
                      color: 'black', 
                      fontSize: '16px',
                      backgroundColor: 'rgba(255, 255, 255, 0.9)'
                    }
                  }}
                />
                
                <FormControl fullWidth>
                  <InputLabel style={{ color: 'rgba(255, 255, 255, 0.7)', fontWeight: '500' }}>
                    Account Type
                  </InputLabel>
                  <Select
                    value={role}
                    onChange={e => setRole(e.target.value)}
                    className="futuristic-input"
                    style={{ color: 'white' }}
                  >
                    <MenuItem value="patient">Patient</MenuItem>
                    <MenuItem value="doctor">Doctor</MenuItem>
                  </Select>
                </FormControl>
              </div>

              {role === 'patient' && (
                <TextField 
                  label="Age" 
                  type="number" 
                  value={age} 
                  onChange={e => setAge(e.target.value)} 
                  required 
                  fullWidth
                  className="futuristic-input"
                  InputLabelProps={{
                    style: { color: 'rgba(0, 0, 0, 0.7)', fontWeight: '500' }
                  }}
                  InputProps={{
                    style: { 
                      color: 'black', 
                      fontSize: '16px',
                      backgroundColor: 'rgba(255, 255, 255, 0.9)'
                    }
                  }}
                />
              )}
              
              <Button 
                type="submit" 
                variant="contained" 
                className="futuristic-btn neon-accent"
                disabled={loading}
                style={{
                  padding: '18px',
                  fontSize: '18px',
                  fontWeight: '700',
                  marginTop: '20px',
                  position: 'relative',
                  overflow: 'hidden',
                  letterSpacing: '1px',
                  textTransform: 'uppercase'
                }}
              >
                {loading ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="loading-spinner" style={{ width: '20px', height: '20px', marginRight: '10px' }} />
                    Creating Account...
                  </div>
                ) : (
                  'Create Account'
                )}
              </Button>
            </Box>

            {error && (
              <Alert 
                severity="error" 
                style={{ 
                  marginTop: '25px',
                  background: 'rgba(255, 68, 68, 0.1)',
                  border: '1px solid rgba(255, 68, 68, 0.3)',
                  color: '#ff4444',
                  borderRadius: '10px'
                }}
              >
                {error}
              </Alert>
            )}

            <Typography style={{ 
              marginTop: '35px', 
              textAlign: 'center',
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '16px'
            }}>
              Already have an account? 
              <Button 
                onClick={() => navigate('/login')}
                style={{
                  color: '#00d4ff',
                  fontWeight: '600',
                  textTransform: 'none',
                  marginLeft: '8px',
                  fontSize: '16px'
                }}
              >
                Sign In
              </Button>
            </Typography>

            {/* Professional Footer */}
            <div style={{
              marginTop: '40px',
              padding: '20px',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              textAlign: 'center'
            }}>
              <Typography style={{
                color: 'rgba(255, 255, 255, 0.5)',
                fontSize: '14px',
                fontWeight: '300'
              }}>
                Secure • HIPAA Compliant • Enterprise Grade
              </Typography>
            </div>
          </CardContent>
        </div>
      </Container>
    </div>
  );
}

export default Signup; 