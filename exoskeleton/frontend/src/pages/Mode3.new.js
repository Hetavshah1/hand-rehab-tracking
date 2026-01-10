import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  TextField,
  Button,
  Chip,
  Slider,
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

// Mode 3 — Optical sensing UI similar to the design in your screenshots

function Mode3() {
  const { id } = useParams();
  const videoRef = useRef(null);
  const webcamRef = useRef(null);
  const [stream, setStream] = useState(null);

  const [missingInput, setMissingInput] = useState('');
  const [missingLandmarks, setMissingLandmarks] = useState(
    Array.from({ length: 6 }).map((_, i) => i)
  );

  const [playing, setPlaying] = useState(false);
  const [similarity, setSimilarity] = useState(27);
  const [status, setStatus] = useState('paused');
  const [sensitivity, setSensitivity] = useState(0.8);
  const [history, setHistory] = useState([]);
  const [completed, setCompleted] = useState(false);
  const [overall, setOverall] = useState(11);
  const startRef = useRef(null);

  useEffect(() => {
    let activeStream;
    async function startWebcam() {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        activeStream = s;
        if (webcamRef.current) webcamRef.current.srcObject = s;
        setStream(s);
      } catch (err) {
        // ignore preview failures
      }
    }
    startWebcam();
    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  // Simulate similarity history while playing
  useEffect(() => {
    let timer;
    if (playing) {
      timer = setInterval(() => {
        setSimilarity((prev) => {
          const drift = (Math.random() - 0.5) * 1.2 - 0.05;
          const next = Math.max(88, Math.min(100, prev + drift));
          setHistory((h) => {
            const now = Date.now();
            const time = startRef.current ? (now - startRef.current) / 1000 : h.length * 0.4;
            const point = { time: Number(time.toFixed(1)), similarity: Math.round(next) };
            return [...h, point].slice(-80);
          });
          return Math.round(95);
        });
      }, 400);
    }
    return () => clearInterval(timer);
  }, [playing]);

  const handleAddMissing = () => {
    if (!missingInput.trim()) return;
    const parts = missingInput
      .split(',')
      .map((p) => p.trim())
      .filter((p) => p !== '' && !isNaN(Number(p)));
    const nums = parts.map((p) => Number(p));
    setMissingLandmarks((prev) =>
      Array.from(new Set([...prev, ...nums])).sort((a, b) => a - b)
    );
    setMissingInput('');
  };

  const handleRemoveMissing = (n) => {
    setMissingLandmarks((prev) => prev.filter((x) => x !== n));
  };

  const handlePlay = () => {
    if (videoRef.current) {
      try {
        videoRef.current.play();
      } catch (e) {}
    }
    const seed = 95 // 93-99
    setSimilarity(seed);
    startRef.current = Date.now();
    setHistory([{ time: 0, similarity: seed }]);
    setPlaying(true);
    setStatus('playing');
  };

  const handlePause = () => {
    if (videoRef.current) {
      try {
        videoRef.current.pause();
      } catch (e) {}
    }
    setPlaying(false);
    setStatus('paused');
  };

  const handleStop = () => {
    if (videoRef.current) {
      try {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      } catch (e) {}
    }
    setPlaying(false);
    setStatus('stopped');
    setSimilarity(0);
    setHistory([]);
  };

  const handleFinish = () => {
    setPlaying(false);
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
    setOverall(avg || 11);
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
        Mode 2
      </Typography>
      <Typography
        variant="body2"
        sx={{ mb: 3, color: 'rgba(255, 255, 255, 0.75)' }}
      >
        Exercise ID: {id || '101'} — Enter missing hand landmarks (0–20). Only non‑missing
        landmarks will be used for comparison.
      </Typography>

      {/* Top card – doctor input for missing landmarks */}
      <Paper
        className="glass-card"
        sx={{
          mb: 4,
          p: 3,
          background: 'rgba(8, 13, 32, 0.9)',
          border: '1px solid rgba(255,255,255,0.08)',
          color: 'white',
        }}
      >
        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
          Doctor: Enter Missing Landmarks
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
          <TextField
            variant="outlined"
            placeholder="Missing Landmarks (comma‑separated, e.g. 0,1,2)"
            value={missingInput}
            onChange={(e) => setMissingInput(e.target.value)}
            fullWidth
            sx={{
              maxWidth: 480,
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                background: 'rgba(255,255,255,0.08)',
                color: 'white',
              },
              '& .MuiInputBase-input::placeholder': {
                color: 'rgba(255,255,255,0.6)',
              },
            }}
            InputLabelProps={{ shrink: false }}
          />
          <Button
            variant="contained"
            onClick={handleAddMissing}
            sx={{
              px: 4,
              borderRadius: 3,
              background:
                'linear-gradient(135deg, #ff6ef8, #7c4dff)',
              fontWeight: 600,
              textTransform: 'none',
            }}
          >
            Add
          </Button>
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
          {missingLandmarks.map((n) => (
            <Chip
              key={n}
              label={`Landmark ${n}`}
              onDelete={() => handleRemoveMissing(n)}
              sx={{
                background: '#ff5252',
                color: 'white',
                fontWeight: 500,
              }}
            />
          ))}
        </Box>

        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
          There are 21 hand landmarks (0–20). Enter the numbers of any missing landmarks. These
          will not be considered in the similarity calculation or shown as glowing in the glove.
        </Typography>
      </Paper>

      {/* Middle row: video + webcam / similarity */}
      <Grid container spacing={3}>
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
                onClick={handlePlay}
                sx={{
                  minWidth: 90,
                  borderRadius: 8,
                  background:
                    'linear-gradient(135deg, #00d4ff, #5b86e5)',
                  fontWeight: 600,
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
                  fontWeight: 600,
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
                  fontWeight: 700,
                  textTransform: 'none',
                }}
              >
                EMERGENCY STOP
              </Button>
            </Box>

            <Box sx={{ mt: 1 }}>
              <Typography sx={{ mb: 1, fontWeight: 500 }}>
                Sensitivity
              </Typography>
              <Slider
                value={sensitivity}
                min={0}
                max={1}
                step={0.05}
                onChange={(_, v) => setSensitivity(v)}
              />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={5}>
          <Paper
            className="glass-card"
            sx={{
              p: 3,
              background: 'rgba(11, 18, 45, 0.96)',
              border: '1px solid rgba(255,255,255,0.06)',
              color: 'white',
              height: '100%',
            }}
          >
            <Typography variant="h6" sx={{ mb: 2 }}>
              Webcam (Glowing Landmarks)
            </Typography>
            <video
              ref={webcamRef}
              autoPlay
              playsInline
              muted
              style={{ width: '100%', borderRadius: 12, background: '#000' }}
            />

            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                Similarity
              </Typography>
              <Typography
                variant="h3"
                sx={{
                  color: similarityColor,
                  fontWeight: 700,
                  mt: 0.5,
                }}
              >
                {similarity}%
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: 'rgba(255,255,255,0.6)' }}
              >
                Status: {status}
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Session complete section */}
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
          <Typography variant="h5" sx={{ mb: 1, fontWeight: 600 }}>
            Session Complete
          </Typography>
          <Typography
            variant="body2"
            sx={{ mb: 3, color: 'rgba(255,255,255,0.7)' }}
          >
            Summary of performance for this session.
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
                  sx={{ color: similarityColor, fontWeight: 700 }}
                >
                  {overall}%
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ mt: 1, color: 'rgba(255,255,255,0.7)' }}
                >
                  A higher value indicates closer match to the demonstration.
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} md={8}>
              <Paper
                sx={{
                  p: 3,
                  borderRadius: 3,
                  background: 'rgba(16, 24, 63, 0.95)',
                }}
              >
                <Typography sx={{ fontWeight: 600, mb: 1 }}>
                  Missing Landmarks
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {missingLandmarks.map((n) => (
                    <Chip
                      key={n}
                      label={`Landmark ${n}`}
                      sx={{
                        background: '#ff5252',
                        color: 'white',
                        fontWeight: 500,
                      }}
                    />
                  ))}
                </Box>
              </Paper>
            </Grid>
          </Grid>

          <Box sx={{ mb: 3 }}>
            <Typography sx={{ fontWeight: 600, mb: 1 }}>
              Similarity History (Time vs Score)
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
                    stroke="#7c4dff"
                    strokeWidth={2}
                    dot={false}
                    name="similarity"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              sx={{
                borderRadius: 8,
                px: 4,
                background:
                  'linear-gradient(135deg, #00d4ff, #7c4dff)',
                fontWeight: 600,
                textTransform: 'none',
              }}
            >
              Export Results
            </Button>
            <Button
              variant="outlined"
              onClick={() => {
                setHistory([]);
                setCompleted(false);
                setStatus('idle');
                setSimilarity(27);
              }}
              sx={{
                borderRadius: 8,
                px: 4,
                borderColor: 'rgba(255,255,255,0.6)',
                color: 'rgba(255,255,255,0.9)',
                textTransform: 'none',
              }}
            >
              New Session
            </Button>
          </Box>
        </Paper>
      )}
    </Container>
  );
}

export default Mode3;


