import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Container, Card, CardContent, Typography, TextField, Button, Box, CircularProgress, Alert } from '@mui/material';
import axios from 'axios';

function EditPatient() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', age: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        // Fetch patient details from backend
        const res = await axios.get(`http://127.0.0.1:5000/patients/${id}`);
        if (!mounted) return;
        setForm({ firstName: res.data.first_name || '', lastName: res.data.last_name || '', email: res.data.email || '', age: res.data.age || '' });
      } catch (err) {
        setError('Could not load patient');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [id]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await axios.put(`http://127.0.0.1:5000/patients/${id}`, form);
      navigate(`/doctor/patient/${id}`);
    } catch (err) {
      setError('Could not save changes');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Container sx={{ mt: 6 }}><CircularProgress /></Container>;

  return (
    <Container maxWidth="sm" sx={{ mt: 6 }}>
      <Card>
        <CardContent>
          <Typography variant="h5" sx={{ mb: 2 }}>Edit Patient</Typography>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <form onSubmit={handleSave}>
            <TextField fullWidth label="First Name" name="firstName" sx={{ mb: 2 }} value={form.firstName} onChange={handleChange} />
            <TextField fullWidth label="Last Name" name="lastName" sx={{ mb: 2 }} value={form.lastName} onChange={handleChange} />
            <TextField fullWidth label="Email" name="email" sx={{ mb: 2 }} value={form.email} onChange={handleChange} />
            <TextField fullWidth label="Age" name="age" sx={{ mb: 2 }} value={form.age} onChange={handleChange} />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button variant="outlined" onClick={() => navigate(-1)}>Cancel</Button>
              <Button type="submit" variant="contained" disabled={saving}>
                {saving ? <CircularProgress size={20} /> : 'Save'}
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Container>
  );
}

export default EditPatient;