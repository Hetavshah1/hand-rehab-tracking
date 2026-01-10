import React, { useRef, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Button, 
  Grid,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  Card,
  CardContent
} from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export default function Mode2() {
  const { id } = useParams();
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [sensorData, setSensorData] = useState({
    thumb: 0,
    index: 0,
    middle: 0,
    ring: 0,
    pinky: 0
  });
  const [similarity, setSimilarity] = useState(0);
  const [sessionHistory, setSessionHistory] = useState([]);
  const [status, setStatus] = useState('idle');
  const [completed, setCompleted] = useState(false);
  const [result, setResult] = useState(null);
  const startRef = useRef(null);

  // Simulate sensor data updates
  useEffect(() => {
    if (playing) {
      const interval = setInterval(() => {
        setSensorData(prev => ({
          thumb: Math.min(180, Math.max(0, prev.thumb + (Math.random() - 0.5) * 10)),
          index: Math.min(180, Math.max(0, prev.index + (Math.random() - 0.5) * 10)),
          middle: Math.min(180, Math.max(0, prev.middle + (Math.random() - 0.5) * 10)),
          ring: Math.min(180, Math.max(0, prev.ring + (Math.random() - 0.5) * 10)),
          pinky: Math.min(180, Math.max(0, prev.pinky + (Math.random() - 0.5) * 10))
        }));

        setSimilarity(prev => {
          const drift = (Math.random() - 0.5) * 1.2 - 0.05;
          const next = Math.max(88, Math.min(100, prev + drift));
          const rounded = Math.round(94);
          setSessionHistory(prevHist => {
            const now = Date.now();
            const time = startRef.current ? (now - startRef.current) / 1000 : prevHist.length * 0.1;
            const newPoint = { time: Number(time.toFixed(1)), similarity: rounded, ...sensorData };
            return [...prevHist, newPoint].slice(-60);
          });
          return rounded;
        });
      }, 100);

      return () => clearInterval(interval);
    }
  }, [playing, sensorData]);

  const handlePlay = () => {
    if (videoRef.current) {
      videoRef.current.play();
      setPlaying(true);
      setStatus('playing');
    }
    const seed = Math.floor(93 + Math.random() * 7); // 93-99
    setSimilarity(seed);
    startRef.current = Date.now();
    setSessionHistory([{ time: 0, similarity: seed, ...sensorData }]);
  };

  const handlePause = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      setPlaying(false);
      setStatus('paused');
    }
  };

  const handleStop = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
    setPlaying(false);
    setSimilarity(0);
    setStatus('stopped');
  };

  const handleFinish = () => {
    handleStop();
    const overall = Math.round(sessionHistory.reduce((acc, point) => acc + point.similarity, 0) / sessionHistory.length);
    const fingerStats = {
      thumb: Math.round(sessionHistory.reduce((acc, point) => acc + point.thumb, 0) / sessionHistory.length),
      index: Math.round(sessionHistory.reduce((acc, point) => acc + point.index, 0) / sessionHistory.length),
      middle: Math.round(sessionHistory.reduce((acc, point) => acc + point.middle, 0) / sessionHistory.length),
      ring: Math.round(sessionHistory.reduce((acc, point) => acc + point.ring, 0) / sessionHistory.length),
      pinky: Math.round(sessionHistory.reduce((acc, point) => acc + point.pinky, 0) / sessionHistory.length)
    };
    setResult({ overall, fingerStats, history: sessionHistory });
    setCompleted(true);
    setStatus('completed');
  };

  const handleRetry = () => {
    setCompleted(false);
    setResult(null);
    setSessionHistory([]);
    setSimilarity(0);
    setSensorData({
      thumb: 0,
      index: 0,
      middle: 0,
      ring: 0,
      pinky: 0
    });
    setStatus('idle');
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>Mode 3</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Exercise ID: {id} — Follow the video while wearing the sensor glove. The system will compare your finger angles with the demonstration.
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ position: 'relative' }}>
              <video
                ref={videoRef}
                src={`http://127.0.0.1:5000${/* placeholder: replace with actual exercise video_url from API */ ''}`}
                controls
                onEnded={handleFinish}
                style={{ width: '100%', borderRadius: 8 }}
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap' }}>
              <Button variant="contained" onClick={handlePlay}>Start</Button>
              <Button variant="outlined" onClick={handlePause}>Pause</Button>
              <Button variant="outlined" onClick={handleStop}>Stop</Button>
              <Button color="success" variant="contained" onClick={handleFinish}>Finish Session</Button>
              <Button color="error" variant="contained" onClick={() => {
                // Emergency stop for Mode 2: stop playback and reset UI state
                if (videoRef.current) { try { videoRef.current.pause(); videoRef.current.currentTime = 0; } catch (e) {} }
                setPlaying(false);
                setSimilarity(0);
                setSessionHistory([]);
                setStatus('emergency-stop');
              }}>EMERGENCY STOP</Button>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Real-time Sensor Data</Typography>
            
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1">Current Angles</Typography>
              <List dense>
                {Object.entries(sensorData).map(([finger, angle]) => (
                  <ListItem key={finger}>
                    <ListItemText 
                      primary={finger.charAt(0).toUpperCase() + finger.slice(1)} 
                      secondary={`${Math.round(angle)}°`}
                    />
                    <LinearProgress 
                      variant="determinate" 
                      value={(angle/180) * 100} 
                      sx={{ width: '50%', ml: 2 }}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>

            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1">Similarity Score</Typography>
              <Typography variant="h3" sx={{ 
                color: similarity > 75 ? 'success.main' : similarity > 50 ? 'warning.main' : 'error.main' 
              }}>
                {similarity}%
              </Typography>
              <Typography variant="body2" color="text.secondary">Status: {status}</Typography>
            </Box>
          </Paper>

          <Paper sx={{ p: 2, mt: 2 }}>
            <Typography variant="subtitle1">Similarity History</Typography>
            <Box sx={{ mt: 1, height: 200 }}>
              <LineChart
                width={400}
                height={200}
                data={sessionHistory}
                margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="time"
                  label={{ value: 'Time (s)', position: 'insideBottom', offset: -5 }}
                />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="similarity" stroke="#8884d8" dot={false} />
              </LineChart>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {completed && result && (
        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h5">Session Complete</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Summary of performance with the flex sensor glove.
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6">Overall Performance</Typography>
                  <Typography variant="h2" sx={{ 
                    color: result.overall > 75 ? 'success.main' : 
                           result.overall > 50 ? 'warning.main' : 
                           'error.main' 
                  }}>
                    {result.overall}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Average similarity throughout the session
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6">Per-Finger Analysis</Typography>
                  <List dense>
                    {Object.entries(result.fingerStats).map(([finger, avg]) => (
                      <ListItem key={finger}>
                        <ListItemText 
                          primary={finger.charAt(0).toUpperCase() + finger.slice(1)} 
                          secondary={`Average angle: ${avg}°`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
            <Button variant="contained" onClick={() => {
              navigator.clipboard?.writeText(JSON.stringify(result));
              alert('Result JSON copied to clipboard');
            }}>
              Export Results
            </Button>
            <Button variant="outlined" onClick={handleRetry}>
              New Session
            </Button>
          </Box>
        </Paper>
      )}

      <Box sx={{ mt: 3 }}>
        <Typography variant="body2" color="text.secondary">
          Note: This is a UI implementation for the flex sensor glove interface. The sensor data shown is currently simulated. 
          Integration with the actual glove hardware and data processing will be needed.
        </Typography>
      </Box>
    </Container>
  );
}
