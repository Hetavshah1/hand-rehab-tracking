import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { SAMPLE_EXERCISES } from './ExerciseLibrary.assets';
import { Container, Card, CardContent, Typography, Grid, Button, Box, TextField, Input } from '@mui/material';

function ExerciseLibrary() {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://127.0.0.1:5000/exercises', {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined
        });
        if (!mounted) return;
        const list = res.data || [];
        setExercises(list.length ? list : SAMPLE_EXERCISES);
      } catch (err) {
        setExercises(SAMPLE_EXERCISES);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    fd.append('name', name);
    fd.append('description', description);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('http://127.0.0.1:5000/exercises/upload', fd, {
        headers: Object.assign({ 'Content-Type': 'multipart/form-data' }, token ? { Authorization: `Bearer ${token}` } : {})
      });
      // Refresh list
  const list = await axios.get('http://127.0.0.1:5000/exercises');
  setExercises(list.data && list.data.length ? list.data : SAMPLE_EXERCISES);
      setFile(null); setName(''); setDescription('');
    } catch (err) {
      console.error('Upload error', err);
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>Exercise Library</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">Upload New Exercise</Typography>
              <Box component="form" onSubmit={handleUpload} sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} />
                <TextField label="Description" value={description} onChange={(e) => setDescription(e.target.value)} multiline rows={3} />
                <Input type="file" onChange={handleFileChange} inputProps={{ accept: 'video/*' }} />
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button variant="outlined" onClick={() => { setFile(null); setName(''); setDescription(''); }}>Clear</Button>
                  <Button type="submit" variant="contained" disabled={uploading}>{uploading ? 'Uploading...' : 'Upload'}</Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">Available Exercises</Typography>
              <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                {exercises.length === 0 && <Typography color="text.secondary">No exercises found.</Typography>}
                {exercises.map((ex) => (
                  <Box key={ex.id} sx={{ display: 'flex', gap: 2, alignItems: 'center', flexDirection: 'column', mb: 2 }}>
                    <Box sx={{ width: '100%' }}>
                      <Typography sx={{ fontWeight: 600 }}>{ex.name}</Typography>
                      <Typography color="text.secondary">{ex.description}</Typography>
                      <Box sx={{ mt: 1 }}>
                        {ex.video_data ? (
                          <video controls style={{ width: '100%', maxHeight: 240 }}>
                            <source src={ex.video_data} />
                            Your browser does not support the video tag.
                          </video>
                        ) : ex.video_url && ex.video_url.startsWith('data:') ? (
                          <video controls style={{ width: '100%', maxHeight: 240 }}>
                            <source src={ex.video_url} />
                            Your browser does not support the video tag.
                          </video>
                        ) : (
                          <video controls style={{ width: '100%', maxHeight: 240 }}>
                            <source src={`http://127.0.0.1:5000${ex.video_url}`} type="video/mp4" />
                            Your browser does not support the video tag.
                          </video>
                        )}
                      </Box>

                      <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                        {/* Quick mode buttons: start a specific mode for this exercise */}
                        <ModeButton exerciseId={ex.id} mode={1} />
                        <ModeButton exerciseId={ex.id} mode={2} />
                        <ModeButton exerciseId={ex.id} mode={3} />
                        <ModeButton exerciseId={ex.id} mode={4} />
                      </Box>
                    </Box>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}

function ModeButton({ exerciseId, mode }) {
  const navigate = useNavigate();
  const label = `Mode ${mode}`;
  const handle = () => navigate(`/exercise/${exerciseId}/mode${mode}`);
  return (
    <Button variant="outlined" size="small" onClick={handle}>{label}</Button>
  );
}

export default ExerciseLibrary;
