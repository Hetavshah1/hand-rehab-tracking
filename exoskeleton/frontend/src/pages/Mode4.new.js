import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Button,
  Slider,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// Mode 4 — Exoskeleton Assisted Exercise (UI matching provided screenshots)

function Mode4() {
  const { id } = useParams();
  const videoRef = useRef(null);

  const [cycles, setCycles] = useState(5);
  const [preset, setPreset] = useState('fast');
  const [multiplier, setMultiplier] = useState(1);
  const [manualRotor, setManualRotor] = useState(0.5);
  const [similarity, setSimilarity] = useState(1);
  const [status, setStatus] = useState('idle');
  const [history, setHistory] = useState([]);
  const [completed, setCompleted] = useState(false);
  const [overallSimilarity, setOverallSimilarity] = useState(7);
  const [cyclesRun, setCyclesRun] = useState(5);
  const startRef = useRef(null);

  // Simulate similarity history when "running"
  useEffect(() => {
    let timer;
    if (status === 'running') {
      timer = setInterval(() => {
        setSimilarity((prev) => {
          const drift = (Math.random() - 0.5) * 1.2 - 0.05; // gentle drift downward
          const next = Math.max(88, Math.min(100, prev + drift));
          setHistory((h) => {
            const now = Date.now();
            const time = startRef.current ? (now - startRef.current) / 1000 : h.length * 0.4;
            const point = { time: Number(time.toFixed(1)), similarity: Math.round(next) };
            return [...h, point].slice(-120);
          });
          return Math.round(98);
        });
      }, 400);
    }
    return () => clearInterval(timer);
  }, [status]);

  const handleStart = () => {
    const seed = Math.floor(98); // 93-99
    setSimilarity(seed);
    startRef.current = Date.now();
    setHistory([{ time: 0, similarity: seed }]);
    setStatus('running');
    if (videoRef.current) {
      try {
        videoRef.current.play();
      } catch (e) {}
    }
  };

  const handlePause = () => {
    setStatus('paused');
    if (videoRef.current) {
      try {
        videoRef.current.pause();
      } catch (e) {}
    }
  };

  const handleStop = () => {
    setStatus('stopped');
    if (videoRef.current) {
      try {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      } catch (e) {}
    }
  };

  const handleFinish = () => {
    setStatus('completed');
    setCompleted(true);
    const avg =
      history.length === 0
        ? similarity
        : Math.max(
            0,
            Math.min(
              100,
              Math.round(
                history.reduce((sum, p) => sum + p.similarity, 0) / history.length
              )
            )
          );
    setOverallSimilarity(avg || 7);
    setCyclesRun(cycles);
  };

  const handleEmergency = () => {
    handleStop();
    setStatus('emergency-stop');
  };

  const similarityColor =
    similarity > 70 ? '#4caf50' : similarity > 40 ? '#ffb300' : '#f44336';

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography
        variant="h3"
        className="animated-text"
        sx={{ mb: 1, fontWeight: 700, letterSpacing: 1 }}
      >
        Mode 1
      </Typography>
      <Typography
        variant="body2"
        sx={{ mb: 3, color: 'rgba(255, 255, 255, 0.75)' }}
      >
        Exercise ID: {id || '101'} — The exoskeleton will drive the patient's movement following
        reference angles from the library. Configure cycles and speed, then start the run. Similarity
        is computed from sensors on the exoskeleton.
      </Typography>

      <Grid container spacing={3}>
        {/* Left: Video and controls */}
        <Grid item xs={12} md={7}>
          <Paper
            className="glass-card"
            sx={{
              p: 3,
              background: 'rgba(11, 18, 45, 0.96)',
              border: '1px solid rgba(255,255,255,0.06)',
              color: 'white',
            }}
          >
            <Box sx={{ mb: 2 }}>
              <video
                ref={videoRef}
                controls
                style={{
                  width: '100%',
                  borderRadius: 12,
                  backgroundColor: '#000',
                }}
              >
                <track kind="captions" />
              </video>
            </Box>

            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 2,
                mb: 3,
              }}
            >
              <Button
                variant="contained"
                onClick={handleStart}
                sx={{
                  minWidth: 110,
                  borderRadius: 8,
                  background:
                    'linear-gradient(135deg, #00d4ff, #5b86e5)',
                  fontWeight: 700,
                  textTransform: 'none',
                }}
              >
                Start
              </Button>
              <Button
                variant="outlined"
                onClick={handlePause}
                sx={{
                  minWidth: 90,
                  borderRadius: 8,
                  borderColor: 'rgba(255,255,255,0.4)',
                  color: 'white',
                  textTransform: 'none',
                }}
              >
                Pause
              </Button>
              <Button
                variant="outlined"
                onClick={handleStop}
                sx={{
                  minWidth: 90,
                  borderRadius: 8,
                  borderColor: 'rgba(255,255,255,0.4)',
                  color: 'white',
                  textTransform: 'none',
                }}
              >
                Stop
              </Button>
              <Button
                variant="contained"
                onClick={handleFinish}
                sx={{
                  minWidth: 140,
                  borderRadius: 8,
                  background:
                    'linear-gradient(135deg, #8971ff, #ff6ef8)',
                  fontWeight: 700,
                  textTransform: 'none',
                }}
              >
                Finish Session
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={handleEmergency}
                sx={{
                  minWidth: 160,
                  borderRadius: 8,
                  fontWeight: 800,
                  textTransform: 'none',
                }}
              >
                EMERGENCY STOP
              </Button>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} sm={4}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Cycles
                </Typography>
                <TextField
                  type="number"
                  value={cycles}
                  onChange={(e) => setCycles(Number(e.target.value) || 0)}
                  fullWidth
                  inputProps={{ min: 1 }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      background: 'rgba(255,255,255,0.08)',
                      color: 'white',
                    },
                    '& input': { color: 'white' },
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Speed Preset
                </Typography>
                <RadioGroup
                  row
                  value={preset}
                  onChange={(e) => {
                    const val = e.target.value;
                    setPreset(val);
                    if (val === 'slow') setMultiplier(0.5);
                    if (val === 'medium') setMultiplier(0.8);
                    if (val === 'fast') setMultiplier(1.0);
                  }}
                >
                  <FormControlLabel
                    value="slow"
                    control={<Radio sx={{ color: 'white' }} />}
                    label="Slow"
                    sx={{ color: 'white' }}
                  />
                  <FormControlLabel
                    value="medium"
                    control={<Radio sx={{ color: 'white' }} />}
                    label="Medium"
                    sx={{ color: 'white' }}
                  />
                  <FormControlLabel
                    value="fast"
                    control={<Radio sx={{ color: 'white' }} />}
                    label="Fast"
                    sx={{ color: 'white' }}
                  />
                </RadioGroup>
              </Grid>

              <Grid item xs={12} sm={4}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Manual Rotor (speed multiplier)
                </Typography>
                <Slider
                  value={manualRotor}
                  min={0}
                  max={1.5}
                  step={0.05}
                  onChange={(_, v) => setManualRotor(v)}
                  sx={{ mt: 2 }}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Right: Status and small chart */}
        <Grid item xs={12} md={5}>
          <Paper
            className="glass-card"
            sx={{
              p: 3,
              background: 'rgba(11, 18, 45, 0.96)',
              border: '1px solid rgba(255,255,255,0.06)',
              color: 'white',
              mb: 3,
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
              Exoskeleton Status
            </Typography>
            <Typography sx={{ mb: 0.5 }}>
              Cycles: {Math.min(cyclesRun, cycles)} / {cycles}
            </Typography>
            <Typography sx={{ mb: 1 }}>
              Preset: {preset} — Multiplier: {multiplier.toFixed(2)}
            </Typography>
            <Typography sx={{ mt: 1, color: 'rgba(255,255,255,0.7)' }}>
              Similarity
            </Typography>
            <Typography
              variant="h3"
              sx={{ color: similarityColor, fontWeight: 800 }}
            >
              {similarity}%
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
              Status: {status}
            </Typography>
          </Paper>

          <Paper
            className="glass-card"
            sx={{
              p: 3,
              background: 'rgba(11, 18, 45, 0.96)',
              border: '1px solid rgba(255,255,255,0.06)',
              color: 'white',
            }}
          >
            <Typography variant="h6" sx={{ mb: 2 }}>
              Similarity History (Time vs Score)
            </Typography>
            <Box sx={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={history}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.12)" />
                  <XAxis
                    dataKey="time"
                    stroke="rgba(255,255,255,0.7)"
                    tick={{ fill: 'rgba(255,255,255,0.7)' }}
                    label={{ value: 'Time (s)', position: 'insideBottom', offset: -5, fill: 'rgba(255,255,255,0.7)' }}
                  />
                  <YAxis
                    domain={[0, 100]}
                    stroke="rgba(255,255,255,0.7)"
                    tick={{ fill: 'rgba(255,255,255,0.7)' }}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(0,0,0,0.85)',
                      borderRadius: 8,
                      border: '1px solid rgba(255,255,255,0.2)',
                      color: '#fff',
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="similarity"
                    stroke="#00d4aa"
                    strokeWidth={2}
                    dot={false}
                    name="similarity"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Session complete */}
      {completed && (
        <Paper
          className="glass-card"
          sx={{
            mt: 4,
            p: 3,
            background: 'rgba(11, 18, 45, 0.96)',
            border: '1px solid rgba(255,255,255,0.06)',
            color: 'white',
          }}
        >
          <Typography variant="h5" sx={{ mb: 1, fontWeight: 700 }}>
            Session Complete
          </Typography>
          <Typography
            variant="body2"
            sx={{ mb: 3, color: 'rgba(255,255,255,0.7)' }}
          >
            Summary of exoskeleton‑assisted run.
          </Typography>

          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={4}>
              <Paper
                sx={{
                  p: 3,
                  borderRadius: 3,
                  background: 'rgba(16, 24, 63, 0.95)',
                }}
              >
                <Typography sx={{ fontWeight: 600, mb: 1 }}>
                  Overall Similarity
                </Typography>
                <Typography
                  variant="h3"
                  sx={{
                    color:
                      overallSimilarity > 70
                        ? '#4caf50'
                        : overallSimilarity > 40
                        ? '#ffb300'
                        : '#f44336',
                    fontWeight: 800,
                  }}
                >
                  {overallSimilarity}%
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ mt: 1, color: 'rgba(255,255,255,0.7)' }}
                >
                  Cycles run: {cyclesRun}
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper
                sx={{
                  p: 3,
                  borderRadius: 3,
                  background: 'rgba(16, 24, 63, 0.95)',
                }}
              >
                <Typography sx={{ fontWeight: 600, mb: 1 }}>
                  Speed
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {preset} (x{multiplier.toFixed(2)})
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper
                sx={{
                  p: 3,
                  borderRadius: 3,
                  background: 'rgba(16, 24, 63, 0.95)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Button
                  variant="contained"
                  sx={{
                    borderRadius: 8,
                    px: 4,
                    background:
                      'linear-gradient(135deg, #00d4ff, #ff6ef8)',
                    fontWeight: 700,
                    textTransform: 'none',
                  }}
                >
                  Export Results
                </Button>
              </Paper>
            </Grid>
          </Grid>

          <Box sx={{ mb: 3 }}>
            <Typography sx={{ fontWeight: 600, mb: 1 }}>
              Similarity History
            </Typography>
            <Box sx={{ height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={history}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.15)" />
                  <XAxis
                    dataKey="time"
                    stroke="rgba(255,255,255,0.7)"
                    tick={{ fill: 'rgba(255,255,255,0.7)' }}
                    label={{ value: 'Time (s)', position: 'insideBottom', offset: -5, fill: 'rgba(255,255,255,0.7)' }}
                  />
                  <YAxis
                    domain={[0, 100]}
                    stroke="rgba(255,255,255,0.7)"
                    tick={{ fill: 'rgba(255,255,255,0.7)' }}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(0,0,0,0.85)',
                      borderRadius: 8,
                      border: '1px solid rgba(255,255,255,0.2)',
                      color: '#fff',
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="similarity"
                    stroke="#00d4aa"
                    strokeWidth={2}
                    dot={false}
                    name="similarity"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Box>
        </Paper>
      )}
    </Container>
  );
}

export default Mode4;




