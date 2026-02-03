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
function RecordExercise({ exerciseId }) {
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);

  const [stream, setStream] = useState(null);
  const [recording, setRecording] = useState(false);
  const [status, setStatus] = useState('');

  useEffect(() => {
    const initCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.error(err);
        setStatus('Camera access denied');
      }
    };

    initCamera();
  }, []);

  const startRecording = () => {
    if (!stream) return;

    recordedChunksRef.current = [];
    mediaRecorderRef.current = new MediaRecorder(stream, {
      mimeType: 'video/webm'
    });

    mediaRecorderRef.current.ondataavailable = (e) => {
      if (e.data.size > 0) recordedChunksRef.current.push(e.data);
    };

    mediaRecorderRef.current.start();
    setRecording(true);
    setStatus('Recording...');
  };

  const stopRecording = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setStatus('Not authenticated');
      return;
    }

    mediaRecorderRef.current.stop();
    setRecording(false);
    setStatus('Uploading...');

    const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
    const formData = new FormData();
    formData.append('video', blob);

    try {
      await axios.post(
        `http://127.0.0.1:5000/exercises/${exerciseId}/reference`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setStatus('Reference saved successfully');
    } catch (err) {
      console.error(err);
      setStatus('Upload failed');
    }
  };

  return (
    <Box>
      <video ref={videoRef} autoPlay muted style={{ width: '100%' }} />
      <Box mt={1}>
        {!recording ? (
          <Button onClick={startRecording} disabled={!stream}>
            Start Recording
          </Button>
        ) : (
          <Button onClick={stopRecording}>
            Stop Recording
          </Button>
        )}
      </Box>
      <Typography variant="body2">{status}</Typography>
    </Box>
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
                  <RecordExercise exerciseId={exercises[0].id} />
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
                <Button
                  onClick={() =>
                    navigate(`/exercise/${ex.id}/mode1`)
                  }
                >
                  Mode 1
                </Button>
              </CardContent>
            </Card>
          ))}
        </Grid>
      </Grid>
    </Container>
  );
  }