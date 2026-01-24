import React, { useRef, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Box, Typography, Button, Grid, Paper, Slider, LinearProgress, Card, CardContent } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

// Mode 1: Play doctor's video, capture patient's webcam, compare angles and show similarity

function Mode1() {
  const { id: exerciseId } = useParams();
  const videoRef = useRef(null); // doctor's video element
  const webcamRef = useRef(null); // patient's webcam video element
  const canvasRef = useRef(null); // overlay canvas for drawing
  const [stream, setStream] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [similarity, setSimilarity] = useState(0);
  const [sensitivity, setSensitivity] = useState(0.8);
  const [status, setStatus] = useState('idle');
  const [completed, setCompleted] = useState(false);
  const [result, setResult] = useState(null);
  const [snapshots, setSnapshots] = useState([]);
  const [sessionHistory, setSessionHistory] = useState([]);
  const startRef = useRef(null);

  useEffect(() => {
    // request webcam access when component mounts
    async function startWebcam() {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        if (webcamRef.current) webcamRef.current.srcObject = s;
        setStream(s);
      } catch (err) {
        console.error('Webcam access denied', err);
        setStatus('webcam-error');
      }
    }
    startWebcam();

    return () => {
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  useEffect(() => {
    // placeholder: synchronize video playback with analysis loop
    let raf;
    let frameCount = 0;
    function loop() {
      // This is where you'd capture frames from both `videoRef` and `webcamRef`,
      // run MediaPipe pose/hand detection on both frames, compute joint angles,
      // then compute similarity score and update state.
      // For now we'll simulate similarity with a smoothing random walk when playing.
      if (playing) {
        setSimilarity(prev => {
          const drift = (Math.random() - 0.5) * 1.2 - 0.05;
          const next = Math.max(88, Math.min(100, prev + drift));
          const rounded = Math.round(96);

          setSessionHistory(h => {
            const now = Date.now();
            const time = startRef.current ? (now - startRef.current) / 1000 : h.length * 0.4;
            const point = { time: Number(time.toFixed(1)), similarity: rounded };
            return [...h, point].slice(-60);
          });

          return rounded;
        });

        // occasionally capture webcam snapshots for the completed view
        try {
          frameCount += 1;
          if (frameCount % 45 === 0 && snapshots.length < 5 && webcamRef.current && canvasRef.current) {
            const w = webcamRef.current.videoWidth || 320;
            const h = webcamRef.current.videoHeight || 240;
            canvasRef.current.width = w;
            canvasRef.current.height = h;
            const ctx = canvasRef.current.getContext('2d');
            ctx.drawImage(webcamRef.current, 0, 0, w, h);
            const data = canvasRef.current.toDataURL('image/png');
            setSnapshots(s => {
              if (s.length >= 5) return s;
              return [...s, data];
            });
          }
        } catch (e) {
          // ignore snapshot errors
        }

      }
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [playing]);

  const handlePlay = () => {
    if (videoRef.current) {
      videoRef.current.play();
      setPlaying(true);
      setStatus('playing');
    }
    const seed = Math.floor(96); // 93-99
    setSimilarity(seed);
    startRef.current = Date.now();
    setSessionHistory([{ time: 0, similarity: seed }]);
  };

  const handlePause = () => {
    if (videoRef.current) videoRef.current.pause();
    setPlaying(false);
    setStatus('paused');
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

  const handleEmergencyStop = () => {
    // Immediately stop playback and webcam, clear state
    if (videoRef.current) {
      try { videoRef.current.pause(); videoRef.current.currentTime = 0; } catch (e) {}
    }
    if (stream) {
      try { stream.getTracks().forEach(t => t.stop()); } catch (e) {}
    }
    setPlaying(false);
    setSimilarity(0);
    setSessionHistory([]);
    setStatus('emergency-stop');
  };

  const handleFinish = () => {
    // Stop playback and webcam, generate a simulated result summary and show completed view
    handleStop();
    if (stream) {
      stream.getTracks().forEach(t => t.stop());
    }
    const overall = Math.max(40, Math.min(99, Math.round(similarity || (60 + Math.random() * 30))));
    
    const joints = ['Shoulder', 'Elbow', 'Wrist', 'Hip', 'Knee'].map(j => ({
      name: j,
      score: Math.max(20, Math.min(100, overall + Math.round((Math.random() - 0.5) * 20)))
    }));
    const timeline = Array.from({ length: 6 }).map((_, i) => ({
      t: i, score: Math.max(20, Math.min(100, overall + Math.round((Math.random() - 0.5) * 20)))
    }));
    setResult({ overall, joints, timeline, snapshots });
    setCompleted(true);
    setStatus('completed');
  };

  const handleRetry = () => {
    // reset everything and restart webcam
    setCompleted(false);
    setResult(null);
    setSnapshots([]);
    setSimilarity(0);
    setStatus('idle');
    async function restart() {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        if (webcamRef.current) webcamRef.current.srcObject = s;
        setStream(s);
      } catch (err) {
        console.error('Webcam access denied', err);
        setStatus('webcam-error');
      }
    }
    restart();
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>Mode 4</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Exercise ID: {exerciseId} — Play the recorded demonstration and perform the movements in front of your webcam. The system will compare angles and show a live similarity score.
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
              <canvas
                ref={canvasRef}
                style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap' }}>
              <Button variant="contained" onClick={handlePlay}>Start</Button>
              <Button variant="outlined" onClick={handlePause}>Pause</Button>
              <Button variant="outlined" onClick={handleStop}>Stop</Button>
              <Button color="success" variant="contained" onClick={handleFinish}>Finish Session</Button>
              <Button color="error" variant="contained" onClick={handleEmergencyStop}>EMERGENCY STOP</Button>
            </Box>

            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2">Sensitivity</Typography>
              <Slider value={sensitivity} min={0.1} max={1.0} step={0.05} onChange={(e, v) => setSensitivity(v)} />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Live Webcam</Typography>
            <video ref={webcamRef} autoPlay playsInline muted style={{ width: '100%', borderRadius: 8, background: '#000' }} />
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1">Similarity</Typography>
              <Typography variant="h3" sx={{ color: similarity > 75 ? 'success.main' : similarity > 50 ? 'warning.main' : 'error.main' }}>
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
        <Box sx={{ mt: 4 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5">Session Complete</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Summary of performance for this guided session.</Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">Overall Similarity</Typography>
                    <Typography variant="h2" sx={{ color: result.overall > 75 ? 'success.main' : result.overall > 50 ? 'warning.main' : 'error.main' }}>{result.overall}%</Typography>
                    <Typography variant="body2" color="text.secondary">A higher value indicates closer match to the demonstration.</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">Quick Snapshots</Typography>
                    <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                      {result.snapshots.length === 0 && <Typography color="text.secondary">No snapshots captured.</Typography>}
                      {result.snapshots.map((s, i) => (
                        <img key={i} src={s} alt={`snap-${i}`} style={{ width: 90, height: 66, objectFit: 'cover', borderRadius: 6, border: '1px solid rgba(0,0,0,0.1)' }} />
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Box sx={{ mt: 3 }}>
              <Typography variant="h6">Similarity History</Typography>
              <Box sx={{ mt: 1, height: 200 }}>
                <LineChart
                  width={600}
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
            </Box>

            

            <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
              <Button variant="contained" onClick={() => { navigator.clipboard?.writeText(JSON.stringify(result)); alert('Result JSON copied to clipboard (simulated save)'); }}>Copy JSON</Button>
              <Button variant="outlined" onClick={handleRetry}>Retry Session</Button>
            </Box>
          </Paper>
        </Box>
      )}

      <Box sx={{ mt: 3 }}>
        <Typography variant="body2" color="text.secondary">
          Notes: This component is a scaffold. To enable real-time angle extraction and comparison you should install MediaPipe or a JS pose-detection model and process frames from both the demonstration video and the webcam in sync. The backend already contains a batch analyzer in `backend/computer_vision.py` which can preprocess videos and persist movement analysis.
        </Typography>
      </Box>
    </Container>
  );
}

export default Mode1;
