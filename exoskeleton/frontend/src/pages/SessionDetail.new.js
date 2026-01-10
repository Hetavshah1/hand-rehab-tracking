import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, CardContent, Typography, Box, Button, CircularProgress } from '@mui/material';
import axios from 'axios';

function SessionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await axios.get(`http://127.0.0.1:5000/sessions/${id}`);
        if (!mounted) return;
        setSession(res.data);
      } catch (err) {
        setSession(null);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [id]);

  if (loading) return <Container sx={{ mt: 6 }}><CircularProgress /></Container>;

  if (!session) return (
    <Container sx={{ mt: 6 }}>
      <Typography>No session found.</Typography>
      <Button variant="contained" onClick={() => navigate(-1)}>Back</Button>
    </Container>
  );

  return (
    <Container maxWidth="md" sx={{ mt: 6 }}>
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5">{session.title || `Session ${session.id}`}</Typography>
            <Button variant="contained" onClick={() => navigate(-1)}>Back</Button>
          </Box>
          <Typography color="text.secondary" sx={{ mt: 2 }}>{session.description || session.notes || 'No details.'}</Typography>
          {/* Add more session details here */}
        </CardContent>
      </Card>
    </Container>
  );
}

export default SessionDetail;