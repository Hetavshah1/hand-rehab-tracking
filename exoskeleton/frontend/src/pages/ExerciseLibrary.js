import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Button,
  Box
} from '@mui/material';

/* =========================
   RECORD REFERENCE EXERCISE
   ========================= */
function RecordReferenceControls({ exerciseId }) {
  const [recording, setRecording] = useState(false);
  const [status, setStatus] = useState('');

  const startReferenceRecording = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://127.0.0.1:5000/exercises/${exerciseId}/reference/start`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRecording(true);
      setStatus('Recording started');
    } catch (err) {
      console.error(err);
      setStatus('Failed to start recording');
    }
  };

  const stopReferenceRecording = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `http://127.0.0.1:5000/exercises/${exerciseId}/reference/stop`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRecording(false);
      setStatus('Recording saved');
      console.log('MP4:', res.data.mp4);
      console.log('PKL:', res.data.pkl);
    } catch (err) {
      console.error(err);
      setStatus('Failed to stop recording');
    }
  };

  return (
    <Box>
      {!recording ? (
        <Button variant="contained" onClick={startReferenceRecording}>
          Start Recording
        </Button>
      ) : (
        <Button variant="contained" color="error" onClick={stopReferenceRecording}>
          Stop Recording
        </Button>
      )}
      <Typography variant="body2" sx={{ mt: 1 }}>
        {status}
      </Typography>
    </Box>
  );
}

function WebcamPreview() {
  const videoRef = useRef(null);

  useEffect(() => {
    const initCamera = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    };

    initCamera();
  }, []);

  return (
    <video
      ref={videoRef}
      autoPlay
      muted
      style={{ width: '100%', borderRadius: 8 }}
    />
  );
}


/* =========================
   EXERCISE LIBRARY PAGE
   ========================= */
export default function ExerciseLibrary() {
  console.log('🔥 ExerciseLibrary.new rendered');

  const [exercises, setExercises] = useState([]);
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [creating, setCreating] = useState(false);

  const navigate = useNavigate();
  const modes = [
  { label: 'Mode 1', path: 'mode1' },
  { label: 'Mode 2', path: 'mode2' },
  { label: 'Mode 3', path: 'mode3' },
  { label: 'Mode 4', path: 'mode4' }
];


  /* ===== LOAD EXERCISES ===== */
  useEffect(() => {
    const loadExercises = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const res = await axios.get(
          'http://127.0.0.1:5000/exercises',
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        setExercises(res.data || []);
      } catch (err) {
        console.error('GET /exercises failed', err.response?.data);
        setExercises([]);
      }
    };

    loadExercises();
  }, []);

  /* ===== CREATE EXERCISE ===== */
  const createExercise = async () => {
    
  console.log("🔥 createExercise ENTERED");

    const token = localStorage.getItem('token');
    if (!token) {
  console.log("❌ createExercise: NO TOKEN");
  return;
}

if (!newName.trim()) {
  console.log("❌ createExercise: EMPTY NAME");
  return;
}

    setCreating(true);

    try {
      const formData = new FormData();
      formData.append('name', newName.trim());
      formData.append('description', newDescription.trim());

      await axios.post(
        'http://127.0.0.1:5000/exercises',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setNewName('');
      setNewDescription('');

      // Reload exercises
      const res = await axios.get(
        'http://127.0.0.1:5000/exercises',
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setExercises(res.data || []);
    } catch (err) {
      console.error('Create exercise failed', err.response?.data);
    } finally {
      setCreating(false);
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Exercise Library
      </Typography>

      <Grid container spacing={2}>
        {/* LEFT: CREATE + RECORD */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
<Typography variant="h6">Create Exercise</Typography>

<TextField
  fullWidth
  label="Exercise Name"
  value={newName}
  onChange={(e) => setNewName(e.target.value)}
  sx={{ mt: 1 }}
/>

<TextField
  fullWidth
  label="Description"
  value={newDescription}
  onChange={(e) => setNewDescription(e.target.value)}
  sx={{ mt: 1 }}
/>

<Button
  variant="contained"
  sx={{ mt: 2 }}
  onClick={() => {
    console.log("🔥 BUTTON CLICKED");
    createExercise();
  }}
>
  Create Exercise
</Button>


                
              {exercises.length > 0 && (
                <>
                  <Typography variant="h6" sx={{ mt: 3 }}>
                    Record Reference Exercise
                  </Typography>
                  <WebcamPreview />

<Box mt={2}>
  <RecordReferenceControls exerciseId={exercises[0].id} />
</Box>

                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* RIGHT: EXERCISE LIST */}
        <Grid item xs={12} md={6}>
          {exercises.map((ex) => (
            <Card key={ex.id} sx={{ mb: 2 }}>
              <CardContent>
                <Typography>{ex.name}</Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
  {modes.map((mode) => (
    <Button
      key={mode.path}
      size="small"
      variant="outlined"
      onClick={() =>
        navigate(`/exercise/${ex.id}/${mode.path}`)
      }
    >
      {mode.label}
    </Button>
  ))}
</Box>

              </CardContent>
            </Card>
          ))}
        </Grid>
      </Grid>
    </Container>
  );
  }