import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Grid, Card, CardContent, Typography, Box, Avatar, Chip, Button, List, ListItem, ListItemText, Tooltip, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import { SAMPLE_EXERCISES } from './ExerciseLibrary.assets';

const GlassContainer = styled(Container)(({ theme }) => ({
  padding: theme.spacing(3),
  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(4),
  },
}));

const StyledCard = styled(Card)(({ theme }) => ({
  background: 'rgba(255,255,255,0.03)',
  backdropFilter: 'blur(12px)',
  borderRadius: theme.spacing(2),
  border: '1px solid rgba(255,255,255,0.08)',
}));

function DoctorPatientProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exercises, setExercises] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState(null);

  // placeholder patient data — replace with API call when ready
  const patient = {
    id,
    name: 'John Doe',
    age: 54,
    condition: 'Post-stroke hemiparesis',
    lastSession: '2025-10-25',
    nextSession: '2025-10-30 14:00',
    goals: [
      { id: 1, title: 'Increase walking endurance', progress: 80 },
      { id: 2, title: 'Improve balance', progress: 60 },
      { id: 3, title: 'Upper limb coordination', progress: 40 },
    ],
    notes: [
      { id: 1, text: 'Patient responded well to balance exercises.' },
      { id: 2, text: 'Recommend increasing walking distance by 5 min/week.' },
    ],
  };

  useEffect(() => {
    let mounted = true;
    async function loadExercises() {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://127.0.0.1:5000/exercises', {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined
        });
        if (!mounted) return;
        const list = res.data || [];
        setExercises(list.length ? list : SAMPLE_EXERCISES);
      } catch (e) {
        setExercises(SAMPLE_EXERCISES);
      }
    }
    loadExercises();
    return () => { mounted = false; };
  }, []);

  // Auto-select first exercise when exercises load
  useEffect(() => {
    if (exercises && exercises.length && !selectedExercise) {
      setSelectedExercise(exercises[0].id);
    }
  }, [exercises]);

  const handleStartMode = (mode) => {
    if (!selectedExercise) {
      alert('Please select an exercise first');
      return;
    }
    // Do NOT auto-assign. Simply navigate to the selected mode page for the chosen exercise.
    navigate(`/exercise/${selectedExercise}/mode${mode}`);
  };

  return (
    <GlassContainer maxWidth="lg">
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Patient Profile
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Overview and clinical progress for patient #{id}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="outlined">Send Message</Button>
          <Button variant="contained">Schedule Session</Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <StyledCard>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ width: 72, height: 72, bgcolor: 'primary.main' }}>
                  <PersonIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">{patient.name}</Typography>
                  <Typography color="text.secondary">Age {patient.age}</Typography>
                  <Typography color="text.secondary">{patient.condition}</Typography>
                </Box>
              </Box>

              <Box sx={{ mt: 3 }}>
                <Chip label={`Next: ${patient.nextSession}`} sx={{ mb: 1 }} />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  Last session: {patient.lastSession}
                </Typography>
              </Box>
            </CardContent>
          </StyledCard>

          <StyledCard sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Care Plan</Typography>
              <List>
                {patient.goals.map((g) => (
                  <ListItem key={g.id} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <ListItemText primary={g.title} />
                    <Typography color="primary">{g.progress}%</Typography>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </StyledCard>

          <StyledCard sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Sessions</Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button variant="outlined" onClick={() => navigate(`/doctor/patient/${patient.id}/sessions`)}>View Sessions</Button>
                <Button variant="outlined" onClick={() => navigate(`/doctor/patient/${patient.id}/sessions`)}>View Progress</Button>
              </Box>
            </CardContent>
          </StyledCard>

          <StyledCard sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Start Mode for this Patient</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Select an exercise and choose a mode to begin. Mode behavior varies (imitation, reps, holds, assessment).</Typography>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel id="exercise-select-label" sx={{ color: 'white' }}>Exercise</InputLabel>
                <Select
                  labelId="exercise-select-label"
                  value={selectedExercise || ''}
                  label="Exercise"
                  onChange={(e) => setSelectedExercise(e.target.value)}
                  sx={{
                    backgroundColor: 'black',
                    color: 'white',
                    '& .MuiSelect-icon': { color: 'white' },
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'white' },
                  }}
                >
                  {exercises.map((ex) => (
                    <MenuItem key={ex.id} value={ex.id} sx={{ backgroundColor: 'black', color: 'white' }}>{ex.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Tooltip title="Mode 1 — Guided video imitation. Play demo and compare movements.">
                  <span>
                    <Button variant="outlined" disabled={!selectedExercise} onClick={() => handleStartMode(1)}>Mode 1</Button>
                  </span>
                </Tooltip>
                <Tooltip title="Mode 2 — Repetition & tempo guidance with counting and metronome.">
                  <span>
                    <Button variant="outlined" disabled={!selectedExercise} onClick={() => handleStartMode(2)}>Mode 2</Button>
                  </span>
                </Tooltip>
                <Tooltip title="Mode 3 — Balance & hold tasks with timers and stability metrics.">
                  <span>
                    <Button variant="outlined" disabled={!selectedExercise} onClick={() => handleStartMode(3)}>Mode 3</Button>
                  </span>
                </Tooltip>
                <Tooltip title="Mode 4 — Guided assessment and graded scoring workflow.">
                  <span>
                    <Button variant="outlined" disabled={!selectedExercise} onClick={() => handleStartMode(4)}>Mode 4</Button>
                  </span>
                </Tooltip>
              </Box>
            </CardContent>
          </StyledCard>
        </Grid>

        <Grid item xs={12} md={8}>
          <StyledCard>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Recent Notes</Typography>
              {patient.notes.map((n) => (
                <Box key={n.id} sx={{ mb: 2, p: 2, background: 'rgba(255,255,255,0.02)', borderRadius: 1 }}>
                  <Typography>{n.text}</Typography>
                </Box>
              ))}
            </CardContent>
          </StyledCard>

          <StyledCard sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Session History</Typography>
              {/* Placeholder table/list — replace with actual session list or chart */}
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button variant="outlined" startIcon={<CalendarTodayIcon />}>View Sessions</Button>
                <Button variant="outlined" startIcon={<TrackChangesIcon />}>View Progress</Button>
              </Box>
            </CardContent>
          </StyledCard>
        </Grid>
      </Grid>
    </GlassContainer>
  );
}

export default DoctorPatientProfile;
