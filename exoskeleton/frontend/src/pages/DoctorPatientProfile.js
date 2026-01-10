import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { 
  Card, CardContent, Typography, TextField, Button, Box, Grid, 
  Checkbox, FormControlLabel, Alert, Input, MenuItem, List, ListItem, 
  ListItemText, Paper, Chip, Avatar, Fab, IconButton
} from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { DateCalendar } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import PersonIcon from '@mui/icons-material/Person';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import MessageIcon from '@mui/icons-material/Message';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AddIcon from '@mui/icons-material/Add';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import SendIcon from '@mui/icons-material/Send';

function DoctorPatientProfile() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [goals, setGoals] = useState([]);
  const [goalForm, setGoalForm] = useState({ description: '', target_value: '', metric_name: '', deadline: '' });
  const [goalError, setGoalError] = useState('');
  const [notes, setNotes] = useState('');
  const [metricName, setMetricName] = useState('');
  const [value, setValue] = useState('');
  const [goal, setGoal] = useState('');
  const [selectedSession, setSelectedSession] = useState('');
  const [uploadingSessionId, setUploadingSessionId] = useState(null);
  const [uploadError, setUploadError] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [calendarSession, setCalendarSession] = useState(null);
  const [selectedMetric, setSelectedMetric] = useState('');
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchMessages = async () => {
    const res = await axios.get(`http://127.0.0.1:5000/patients/${id}/messages`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    setMessages(res.data);
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        console.log('Fetching profile for patient ID:', id);
        console.log('Token:', localStorage.getItem('token'));
        
        const res = await axios.get(`http://127.0.0.1:5000/patients/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        console.log('Profile data received:', res.data); // Debug log
        console.log('Profile name:', res.data.name);
        console.log('Profile email:', res.data.email);
        console.log('Profile age:', res.data.age);
        console.log('Profile diagnosis:', res.data.diagnosis);
        console.log('Sessions:', res.data.sessions);
        setProfile(res.data);
        setSessions(res.data.sessions || []);
      } catch (error) {
        console.error('Error fetching profile:', error);
        console.error('Error response:', error.response?.data);
        console.error('Error status:', error.response?.status);
        setProfile(null);
        setSessions([]);
      } finally {
        setLoading(false);
      }
    };
    
    const fetchGoals = async () => {
      try {
        const res = await axios.get(`http://127.0.0.1:5000/patients/${id}/goals`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        console.log('Goals data:', res.data); // Debug log
        setGoals(res.data);
      } catch (error) {
        console.error('Error fetching goals:', error);
        setGoals([]);
      }
    };
    
    const fetchMessages = async () => {
      try {
        const res = await axios.get(`http://127.0.0.1:5000/patients/${id}/messages`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        console.log('Messages data:', res.data); // Debug log
        setMessages(res.data);
      } catch (error) {
        console.error('Error fetching messages:', error);
        setMessages([]);
      }
    };
    
    if (id) {
      fetchProfile();
      fetchGoals();
      fetchMessages();
    }
  }, [id]);

  const handleAddGoal = async (e) => {
    e.preventDefault();
    setGoalError('');
    try {
      await axios.post(`http://127.0.0.1:5000/patients/${id}/goals`, goalForm, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setGoalForm({ description: '', target_value: '', metric_name: '', deadline: '' });
      const res = await axios.get(`http://127.0.0.1:5000/patients/${id}/goals`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setGoals(res.data);
    } catch {
      setGoalError('Failed to add goal.');
    }
  };

  const handleFileUpload = async (sessionId, e) => {
    setUploadError('');
    setUploadingSessionId(sessionId);
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      await axios.post(`http://127.0.0.1:5000/sessions/${sessionId}/upload`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      // Refresh sessions
      const res = await axios.get(`http://127.0.0.1:5000/patients/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setSessions(res.data.sessions);
    } catch {
      setUploadError('Failed to upload file.');
    }
    setUploadingSessionId(null);
  };

  const handleCalendarChange = (date) => {
    setSelectedDate(date);
    const found = sessions.find(s => dayjs(s.date).isSame(date, 'day'));
    setCalendarSession(found || null);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    await axios.post(`http://127.0.0.1:5000/patients/${id}/messages`, { content: newMessage }, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    setNewMessage('');
    fetchMessages();
  };

  // Prepare data for graph
  console.log('Sessions for graph:', sessions);
  console.log('Sessions progress data:', sessions.map(s => ({ id: s.id, progress: s.progress })));
  
  const allMetrics = Array.from(new Set(sessions.flatMap(s => (s.progress || []).map(p => p.metric_name))));
  console.log('All metrics:', allMetrics);
  
  const progressData = [];
  sessions.forEach(session => {
    (session.progress || []).forEach(p => {
      if (!selectedMetric || p.metric_name === selectedMetric) {
        progressData.push({
          date: session.date ? new Date(session.date).toLocaleDateString() : '',
          metric: p.metric_name,
          value: p.value,
          goal: p.goal
        });
      }
    });
  });
  
  console.log('Progress data for chart:', progressData);

  // Calculate statistics
  console.log('Goals data:', goals);
  console.log('Sessions length:', sessions.length);
  
  const totalSessions = sessions.length;
  const completedGoals = goals.filter(g => g.achieved).length;
  const totalGoals = goals.length;
  const progressPercentage = totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0;
  
  console.log('Statistics:', { totalSessions, completedGoals, totalGoals, progressPercentage });

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'transparent', padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box sx={{ textAlign: 'center' }}>
          <div className="loading-spinner" style={{ margin: '0 auto', width: '50px', height: '50px' }} />
          <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)', mt: 2 }}>
            Loading patient profile...
          </Typography>
        </Box>
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={{ minHeight: '100vh', background: 'transparent', padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h4" sx={{ color: 'white', mb: 2 }}>
            Patient Not Found
          </Typography>
          <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            The patient profile could not be loaded. Please check the patient ID.
          </Typography>
        </Box>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'transparent', padding: '20px' }}>
      <Box sx={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Professional Header */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 4,
          flexWrap: 'wrap',
          gap: 2
        }}>
          <div>
            <Typography 
              variant="h3" 
              className="animated-text"
              style={{ 
                fontWeight: '700',
                fontSize: '2.5rem',
                letterSpacing: '1px',
                marginBottom: '8px'
              }}
            >
              Patient Profile
            </Typography>
            <Typography 
              variant="h6" 
              style={{ 
                color: 'rgba(255, 255, 255, 0.7)',
                fontWeight: '300',
                letterSpacing: '0.5px'
              }}
            >
              Detailed Patient Management & Analytics
            </Typography>
          </div>
        </Box>

        {/* Patient Profile Card */}
        <Card className="glass-card pulse-glow" sx={{ mb: 4 }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Avatar 
                sx={{ 
                  width: 80, 
                  height: 80, 
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  fontSize: '2rem'
                }}
              >
                <PersonIcon sx={{ fontSize: '2.5rem' }} />
              </Avatar>
              
              <Box sx={{ flex: 1 }}>
                <Typography variant="h5" sx={{ fontWeight: '600', mb: 1 }}>
                  {profile.name || 'Loading...'}
                </Typography>
                <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1 }}>
                  {profile.email || 'Loading...'}
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Chip 
                    label={`Age: ${profile.age || 'N/A'}`} 
                    sx={{ 
                      background: 'rgba(0, 212, 255, 0.2)',
                      color: '#00d4ff',
                      border: '1px solid rgba(0, 212, 255, 0.3)'
                    }} 
                  />
                  <Chip 
                    label={`Diagnosis: ${profile.diagnosis || 'Not specified'}`} 
                    sx={{ 
                      background: 'rgba(255, 0, 212, 0.2)',
                      color: '#ff00d4',
                      border: '1px solid rgba(255, 0, 212, 0.3)'
                    }} 
                  />
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card className="glass-card floating-element">
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <CalendarTodayIcon sx={{ fontSize: '3rem', color: '#00d4ff', mb: 2 }} />
                <Typography variant="h4" sx={{ fontWeight: '700', mb: 1 }}>
                  {totalSessions}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  Total Sessions
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card className="glass-card floating-element" style={{ animationDelay: '0.5s' }}>
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <FitnessCenterIcon sx={{ fontSize: '3rem', color: '#ff00d4', mb: 2 }} />
                <Typography variant="h4" sx={{ fontWeight: '700', mb: 1 }}>
                  {completedGoals}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  Goals Achieved
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card className="glass-card floating-element" style={{ animationDelay: '1s' }}>
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <TrendingUpIcon sx={{ fontSize: '3rem', color: '#00ffd4', mb: 2 }} />
                <Typography variant="h4" sx={{ fontWeight: '700', mb: 1 }}>
                  {Math.round(progressPercentage)}%
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  Progress Rate
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card className="glass-card floating-element" style={{ animationDelay: '1.5s' }}>
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <MessageIcon sx={{ fontSize: '3rem', color: '#d400ff', mb: 2 }} />
                <Typography variant="h4" sx={{ fontWeight: '700', mb: 1 }}>
                  {messages.length}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  Messages
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Main Content Grid */}
        <Grid container spacing={4}>
          {/* Goals Section */}
          <Grid item xs={12} md={6}>
            <Card className="glass-card">
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h5" sx={{ fontWeight: '600', mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FitnessCenterIcon sx={{ color: '#00d4ff' }} />
                  Patient Goals
                </Typography>
                
                {goals.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                      No goals set yet
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {goals.map(g => (
                      <Card key={g.id} sx={{ 
                        background: 'rgba(255, 255, 255, 0.08)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '12px'
                      }}>
                        <CardContent sx={{ p: 3 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                            <Typography variant="h6" sx={{ fontWeight: '600', color: 'white' }}>
                              {g.description}
                            </Typography>
                            <Chip 
                              label={g.achieved ? "Achieved" : "In Progress"} 
                              sx={{ 
                                background: g.achieved ? 'rgba(0, 255, 136, 0.2)' : 'rgba(255, 193, 7, 0.2)',
                                color: g.achieved ? '#00ff88' : '#ffc107',
                                border: g.achieved ? '1px solid rgba(0, 255, 136, 0.3)' : '1px solid rgba(255, 193, 7, 0.3)',
                                fontWeight: '600'
                              }} 
                            />
                          </Box>
                          
                          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
                            <Box sx={{ 
                              background: 'rgba(255, 255, 255, 0.05)',
                              padding: '12px',
                              borderRadius: '8px',
                              border: '1px solid rgba(255, 255, 255, 0.1)'
                            }}>
                              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', fontWeight: '500' }}>
                                Metric
                              </Typography>
                              <Typography variant="body1" sx={{ fontWeight: '600', color: 'white', mt: 0.5 }}>
                                {g.metric_name}
                              </Typography>
                            </Box>
                            <Box sx={{ 
                              background: 'rgba(255, 255, 255, 0.05)',
                              padding: '12px',
                              borderRadius: '8px',
                              border: '1px solid rgba(255, 255, 255, 0.1)'
                            }}>
                              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', fontWeight: '500' }}>
                                Target
                              </Typography>
                              <Typography variant="body1" sx={{ fontWeight: '600', color: 'white', mt: 0.5 }}>
                                {g.target_value}
                              </Typography>
                            </Box>
                          </Box>
                          
                          <Box sx={{ 
                            background: 'rgba(0, 212, 255, 0.1)',
                            padding: '12px',
                            borderRadius: '8px',
                            border: '1px solid rgba(0, 212, 255, 0.2)'
                          }}>
                            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', fontWeight: '500' }}>
                              Deadline: {g.deadline ? new Date(g.deadline).toLocaleDateString() : 'N/A'}
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    ))}
                  </Box>
                )}

                {/* Add Goal Form */}
                <Box component="form" onSubmit={handleAddGoal} sx={{ mt: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: '600', color: 'white', mb: 1 }}>
                    Add New Goal
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(0, 0, 0, 0.8)', mb: 2 }}>
                    Set specific, measurable goals for your patient's therapy progress
                  </Typography>
                  <TextField 
                    label="Goal Description" 
                    placeholder="e.g., Improve hand flexibility, increase grip strength"
                    value={goalForm.description} 
                    onChange={e => setGoalForm(f => ({ ...f, description: e.target.value }))} 
                    required 
                    fullWidth
                    className="futuristic-input"
                    InputLabelProps={{
                      style: { color: 'rgba(0, 0, 0, 0.7)' }
                    }}
                    InputProps={{
                      style: { 
                        color: 'black',
                        backgroundColor: 'rgba(255, 255, 255, 0.9)'
                      }
                    }}
                  />
                  <TextField 
                    label="Metric Name" 
                    placeholder="e.g., Flexibility, Grip Strength, Range of Motion"
                    value={goalForm.metric_name} 
                    onChange={e => setGoalForm(f => ({ ...f, metric_name: e.target.value }))} 
                    required 
                    fullWidth
                    className="futuristic-input"
                    InputLabelProps={{
                      style: { color: 'rgba(0, 0, 0, 0.7)' }
                    }}
                    InputProps={{
                      style: { 
                        color: 'black',
                        backgroundColor: 'rgba(255, 255, 255, 0.9)'
                      }
                    }}
                  />
                  <TextField 
                    label="Target Value" 
                    type="number" 
                    placeholder="e.g., 90 (for degrees), 50 (for strength)"
                    value={goalForm.target_value} 
                    onChange={e => setGoalForm(f => ({ ...f, target_value: e.target.value }))} 
                    required 
                    fullWidth
                    className="futuristic-input"
                    InputLabelProps={{
                      style: { color: 'rgba(0, 0, 0, 0.7)' }
                    }}
                    InputProps={{
                      style: { 
                        color: 'black',
                        backgroundColor: 'rgba(255, 255, 255, 0.9)'
                      }
                    }}
                  />
                  <TextField 
                    label="Deadline" 
                    type="date" 
                    placeholder="Select target completion date"
                    InputLabelProps={{ shrink: true }} 
                    value={goalForm.deadline} 
                    onChange={e => setGoalForm(f => ({ ...f, deadline: e.target.value }))} 
                    fullWidth
                    className="futuristic-input"
                    InputLabelProps={{
                      style: { color: 'rgba(0, 0, 0, 0.7)' }
                    }}
                    InputProps={{
                      style: { 
                        color: 'black',
                        backgroundColor: 'rgba(255, 255, 255, 0.9)'
                      }
                    }}
                  />
                  <Button 
                    type="submit" 
                    variant="contained"
                    className="futuristic-btn"
                    sx={{
                      background: 'linear-gradient(135deg, #667eea, #764ba2)',
                      fontWeight: '600',
                      textTransform: 'none',
                      padding: '12px 24px'
                    }}
                  >
                    <AddIcon sx={{ mr: 1 }} />
                    Add Goal
                  </Button>
                  {goalError && (
                    <Alert 
                      severity="error" 
                      sx={{ 
                        background: 'rgba(255, 68, 68, 0.1)',
                        border: '1px solid rgba(255, 68, 68, 0.3)',
                        color: '#ff4444'
                      }}
                    >
                      {goalError}
                    </Alert>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Calendar Section */}
          <Grid item xs={12} md={6}>
            <Card className="glass-card">
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h5" sx={{ fontWeight: '600', mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CalendarTodayIcon sx={{ color: '#ff00d4' }} />
                  Session Calendar
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(0, 0, 0, 0.8)', mb: 2 }}>
                  Click on dates to view session details. Sessions will be highlighted on the calendar
                </Typography>
                
                <Box sx={{ 
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '12px',
                  padding: '20px',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  {sessions.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Typography sx={{ color: 'rgba(255, 255, 255, 0.5)', mb: 2 }}>
                        No sessions recorded yet
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.3)' }}>
                        Sessions will appear here once they are added
                      </Typography>
                    </Box>
                  ) : (
                    <DateCalendar 
                      date={selectedDate} 
                      onChange={handleCalendarChange}
                    sx={{
                      width: '100%',
                      '& .MuiPickersCalendarHeader-root': {
                        color: 'white',
                        marginBottom: '16px',
                        '& .MuiPickersCalendarHeader-label': {
                          color: 'white',
                          fontWeight: '700',
                          fontSize: '1.1rem'
                        },
                        '& .MuiIconButton-root': {
                          color: 'white'
                        }
                      },
                      '& .MuiDayCalendar-weekContainer': {
                        color: 'white',
                        marginBottom: '8px'
                      },
                      '& .MuiPickersDay-root': {
                        color: 'white',
                        fontWeight: '700',
                        fontSize: '1rem',
                        width: '40px',
                        height: '40px',
                        borderRadius: '8px',
                        margin: '2px',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        background: 'rgba(255, 255, 255, 0.1)',
                        '&.Mui-selected': {
                          background: 'linear-gradient(135deg, #667eea, #764ba2)',
                          color: 'white',
                          fontWeight: '700',
                          boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
                        },
                        '&.MuiPickersDay-today': {
                          border: '2px solid #ff00d4',
                          color: '#ff00d4',
                          fontWeight: '700'
                        }
                      },
                      '& .MuiDayCalendar-weekDayLabel': {
                        color: 'rgba(255, 255, 255, 0.9)',
                        fontWeight: '700',
                        fontSize: '0.9rem',
                        width: '36px',
                        height: '36px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }
                    }}
                  />
                  )}
                </Box>
                
                {calendarSession && (
                  <Card sx={{ 
                    mt: 3,
                    background: 'rgba(0, 212, 255, 0.1)',
                    border: '1px solid rgba(0, 212, 255, 0.3)',
                    borderRadius: '12px'
                  }}>
                    <CardContent sx={{ p: 3 }}>
                      <Typography variant="h6" sx={{ fontWeight: '500', mb: 2 }}>
                        Session Details
                      </Typography>
                      <Typography sx={{ mb: 1 }}>
                        <strong>Date:</strong> {calendarSession.date ? new Date(calendarSession.date).toLocaleDateString() : ''}
                      </Typography>
                      <Typography sx={{ mb: 1 }}>
                        <strong>Notes:</strong> {calendarSession.notes}
                      </Typography>
                      {calendarSession.notes_file && (
                        <Button
                          href={`http://127.0.0.1:5000/uploads/${calendarSession.notes_file}`}
                          target="_blank"
                          sx={{ 
                            color: '#00d4ff',
                            textTransform: 'none',
                            fontWeight: '500'
                          }}
                        >
                          <AttachFileIcon sx={{ mr: 1 }} />
                          View Uploaded File
                        </Button>
                      )}
                      <Typography sx={{ mt: 2, fontWeight: '500' }}>
                        Progress:
                      </Typography>
                      {calendarSession.progress.map((p, i) => (
                        <Typography key={i} sx={{ ml: 2, color: 'rgba(255, 255, 255, 0.8)' }}>
                          {p.metric_name}: {p.value} (Goal: {p.goal})
                        </Typography>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Sessions Section */}
          <Grid item xs={12}>
            <Card className="glass-card">
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h5" sx={{ fontWeight: '600', mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CalendarTodayIcon sx={{ color: '#00ffd4' }} />
                  Session History
                </Typography>
                
                <Grid container spacing={3}>
                  {sessions.map(s => (
                    <Grid item xs={12} md={6} key={s.id}>
                      <Card sx={{ 
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '12px'
                      }}>
                        <CardContent sx={{ p: 3 }}>
                          <Typography variant="h6" sx={{ fontWeight: '500', mb: 2 }}>
                            Session #{s.id}
                          </Typography>
                          <Typography sx={{ mb: 1, color: 'rgba(255, 255, 255, 0.8)' }}>
                            <strong>Date:</strong> {s.date ? new Date(s.date).toLocaleDateString() : 'N/A'}
                          </Typography>
                          <Typography sx={{ mb: 2, color: 'rgba(255, 255, 255, 0.8)' }}>
                            <strong>Notes:</strong> {s.notes || 'No notes'}
                          </Typography>
                          
                          {s.notes_file && (
                            <Button
                              href={`http://127.0.0.1:5000/uploads/${s.notes_file}`}
                              target="_blank"
                              sx={{ 
                                color: '#00d4ff',
                                textTransform: 'none',
                                fontWeight: '500',
                                mb: 2
                              }}
                            >
                              <AttachFileIcon sx={{ mr: 1 }} />
                              View Uploaded File
                            </Button>
                          )}
                          
                          <Box sx={{ mb: 2 }}>
                            <Typography sx={{ fontWeight: '500', mb: 1 }}>
                              Progress Metrics:
                            </Typography>
                            {s.progress.map((p, i) => (
                              <Chip 
                                key={i}
                                label={`${p.metric_name}: ${p.value}`}
                                size="small"
                                sx={{ 
                                  mr: 1, 
                                  mb: 1,
                                  background: 'rgba(0, 255, 212, 0.2)',
                                  color: '#00ffd4',
                                  border: '1px solid rgba(0, 255, 212, 0.3)'
                                }} 
                              />
                            ))}
                          </Box>
                          
                          <Box sx={{ mt: 2 }}>
                            <Input 
                              type="file" 
                              onChange={e => handleFileUpload(s.id, e)} 
                              disabled={uploadingSessionId === s.id}
                              sx={{ 
                                color: 'white',
                                '&::before': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                                '&::after': { borderColor: '#00d4ff' }
                              }}
                            />
                            {uploadError && uploadingSessionId === s.id && (
                              <Alert 
                                severity="error" 
                                sx={{ 
                                  mt: 1,
                                  background: 'rgba(255, 68, 68, 0.1)',
                                  border: '1px solid rgba(255, 68, 68, 0.3)',
                                  color: '#ff4444'
                                }}
                              >
                                {uploadError}
                              </Alert>
                            )}
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Progress Chart */}
          <Grid item xs={12}>
            <Card className="glass-card">
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h5" sx={{ fontWeight: '600', mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TrendingUpIcon sx={{ color: '#d400ff' }} />
                  Progress Analytics
                </Typography>
                
                <Box sx={{ mb: 3 }}>
                  <TextField 
                    select 
                    label="Metric Filter" 
                    value={selectedMetric} 
                    onChange={e => setSelectedMetric(e.target.value)} 
                    sx={{ minWidth: 200 }}
                    className="futuristic-input"
                    InputLabelProps={{
                      style: { color: 'rgba(0, 0, 0, 0.7)' }
                    }}
                    InputProps={{
                      style: { 
                        color: 'black',
                        backgroundColor: 'rgba(255, 255, 255, 0.9)'
                      }
                    }}
                  >
                    <MenuItem value="">All Metrics</MenuItem>
                    {allMetrics.map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
                  </TextField>
                </Box>
                
                {progressData.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 6 }}>
                    <TrendingUpIcon sx={{ fontSize: '4rem', color: 'rgba(255, 255, 255, 0.3)', mb: 2 }} />
                    <Typography sx={{ color: 'rgba(255, 255, 255, 0.5)', mb: 1 }}>
                      No progress data available
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.3)' }}>
                      Progress charts will appear here once sessions with metrics are recorded
                    </Typography>
                  </Box>
                ) : (
                  <div className="chart-container">
                    <ResponsiveContainer width="100%" height={400}>
                      <AreaChart data={progressData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#00d4ff" stopOpacity={0.1}/>
                        </linearGradient>
                        <linearGradient id="colorGoal" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ff00d4" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#ff00d4" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                      <XAxis 
                        dataKey="date" 
                        stroke="rgba(255, 255, 255, 0.7)"
                        fontSize={12}
                      />
                      <YAxis 
                        stroke="rgba(255, 255, 255, 0.7)"
                        fontSize={12}
                      />
                      <Tooltip 
                        contentStyle={{
                          background: 'rgba(0, 0, 0, 0.8)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          borderRadius: '8px',
                          color: 'white'
                        }}
                      />
                      <Legend />
                      <Area 
                        type="monotone" 
                        dataKey="value" 
                        name="Current Value" 
                        stroke="#00d4ff" 
                        fillOpacity={1} 
                        fill="url(#colorValue)" 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="goal" 
                        name="Target Goal" 
                        stroke="#ff00d4" 
                        fillOpacity={1} 
                        fill="url(#colorGoal)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Messages Section */}
          <Grid item xs={12}>
            <Card className="glass-card">
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h5" sx={{ fontWeight: '600', mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <MessageIcon sx={{ color: '#00d4ff' }} />
                  Patient Communication
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(0, 0, 0, 0.8)', mb: 2 }}>
                  Send messages to your patient. They can respond and ask questions about their therapy
                </Typography>
                
                <Paper sx={{ 
                  maxHeight: 400, 
                  overflow: 'auto', 
                  mb: 3,
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px'
                }}>
                  <List>
                    {messages.map(m => (
                      <ListItem key={m.id} alignItems="flex-start" sx={{ 
                        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                        '&:last-child': { borderBottom: 'none' }
                      }}>
                        <ListItemText
                          primary={m.content}
                          secondary={
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                                {new Date(m.timestamp).toLocaleString()}
                              </Typography>
                              <Chip 
                                label={m.sender_id === profile?.user_id ? 'Patient' : 'Doctor'} 
                                size="small"
                                sx={{ 
                                  background: m.sender_id === profile?.user_id ? 'rgba(0, 212, 255, 0.2)' : 'rgba(255, 0, 212, 0.2)',
                                  color: m.sender_id === profile?.user_id ? '#00d4ff' : '#ff00d4',
                                  border: m.sender_id === profile?.user_id ? '1px solid rgba(0, 212, 255, 0.3)' : '1px solid rgba(255, 0, 212, 0.3)'
                                }} 
                              />
                            </Box>
                          }
                          primaryTypographyProps={{ color: 'white', fontWeight: '500' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Paper>
                
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    placeholder="e.g., How are you feeling today? Any improvements in your therapy?"
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    fullWidth
                    multiline
                    rows={2}
                    className="futuristic-input"
                    InputLabelProps={{
                      style: { color: 'rgba(0, 0, 0, 0.7)' }
                    }}
                    InputProps={{
                      style: { 
                        color: 'black',
                        backgroundColor: 'rgba(255, 255, 255, 0.9)'
                      }
                    }}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                  />
                  <Button 
                    variant="contained" 
                    onClick={handleSendMessage}
                    className="futuristic-btn"
                    sx={{
                      background: 'linear-gradient(135deg, #667eea, #764ba2)',
                      borderRadius: '12px',
                      minWidth: '120px',
                      fontWeight: '600'
                    }}
                  >
                    <SendIcon sx={{ mr: 1 }} />
                    Send
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </div>
  );
}

export default DoctorPatientProfile;