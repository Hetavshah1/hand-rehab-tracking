import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Card, CardContent, Typography, TextField, Button, Box, CircularProgress, Alert } from '@mui/material';
import axios from 'axios';

function NewPatient() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', age: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // Replace URL with your backend endpoint for creating patients
      await axios.post('http://127.0.0.1:5000/patients', form);
      navigate('/doctor');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create patient');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 6 }}>
      <Card>
        <CardContent>
          <Typography variant="h5" sx={{ mb: 2 }}>Add New Patient</Typography>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <form onSubmit={handleSubmit}>
            <TextField fullWidth label="First Name" name="firstName" sx={{ mb: 2 }} value={form.firstName} onChange={handleChange} />
            <TextField fullWidth label="Last Name" name="lastName" sx={{ mb: 2 }} value={form.lastName} onChange={handleChange} />
            <TextField fullWidth label="Email" name="email" sx={{ mb: 2 }} value={form.email} onChange={handleChange} />
            <TextField fullWidth label="Age" name="age" sx={{ mb: 2 }} value={form.age} onChange={handleChange} />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button variant="outlined" onClick={() => navigate('/doctor')}>Cancel</Button>
              <Button type="submit" variant="contained" disabled={loading}>
                {loading ? <CircularProgress size={20} /> : 'Create'}
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Container>
  );
}

export default NewPatient;