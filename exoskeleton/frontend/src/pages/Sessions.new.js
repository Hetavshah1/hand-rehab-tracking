import React, { useEffect, useState } from 'react';
import { Container, Card, CardContent, Typography, List, ListItem, ListItemText, Button, Box, CircularProgress } from '@mui/material';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

function Sessions() {
  const [sessions, setSessions] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const { id: patientId } = useParams();

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const url = patientId ? `http://127.0.0.1:5000/patients/${patientId}/sessions` : 'http://127.0.0.1:5000/sessions';
        const res = await axios.get(url);
        if (!mounted) return;
        setSessions(res.data || []);
      } catch (err) {
        setSessions([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  if (loading) return <Container sx={{ mt: 6 }}><CircularProgress /></Container>;

  return (
    <Container maxWidth="md" sx={{ mt: 6 }}>
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5">Sessions</Typography>
            <Button variant="contained" onClick={() => navigate(-1)}>Back</Button>
          </Box>
          {sessions.length === 0 ? (
            <Typography color="text.secondary">No sessions available.</Typography>
          ) : (
            <List>
              {sessions.map((s) => (
                <ListItem key={s.id} secondaryAction={<Button onClick={() => navigate(`/patient/session/${s.id}`)}>View</Button>}>
                  <ListItemText primary={s.title || `Session ${s.id}`} secondary={s.date || s.scheduled_at} />
                </ListItem>
              ))}
            </List>
          )}
        </CardContent>
      </Card>
    </Container>
  );
}

export default Sessions;