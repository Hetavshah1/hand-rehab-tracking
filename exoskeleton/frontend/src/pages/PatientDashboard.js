import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  Container, Card, CardContent, Typography, Button, Box, Grid, 
  Checkbox, FormControlLabel, List, ListItem, ListItemText, TextField, 
  MenuItem, Paper, Chip, Avatar, LinearProgress, IconButton
} from '@mui/material';
import { DateCalendar } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import MessageIcon from '@mui/icons-material/Message';
import PersonIcon from '@mui/icons-material/Person';

function PatientDashboard() {
  const [profile, setProfile] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [goals, setGoals] = useState([]);
  const [assignedExercises, setAssignedExercises] = useState([]);
  const navigate = useNavigate();

  const [selectedDate, setSelectedDate] = useState(null);
  const [calendarSession, setCalendarSession] = useState(null);
  const [selectedMetric, setSelectedMetric] = useState('');
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  const handleCalendarChange = (date) => {
    setSelectedDate(date);
    const found = sessions.find(s => dayjs(s.date).isSame(date, 'day'));
    setCalendarSession(found || null);
  };

  const fetchMessages = async () => {
    const res = await axios.get('http://127.0.0.1:5000/messages', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    setMessages(res.data);
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get('http://127.0.0.1:5000/profile', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setProfile(res.data);
      } catch (err) {
        if (err.response && err.response.status === 403) {
          navigate('/login');
        }
      }
    };
    const fetchSessions = async () => {
      try {
        const res = await axios.get('http://127.0.0.1:5000/sessions', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setSessions(res.data);
      } catch (err) {}
    };
    const fetchGoals = async () => {
      try {
        const res = await axios.get('http://127.0.0.1:5000/goals', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setGoals(res.data);
      } catch (err) {}
    };
    const fetchAssignedExercises = async () => {
      try {
        const res = await axios.get('http://127.0.0.1:5000/assigned_exercises', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setAssignedExercises(res.data);
      } catch (err) {}
    };
    fetchProfile();
    fetchSessions();
    fetchGoals();
    fetchAssignedExercises();
    fetchMessages();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    await axios.post('http://127.0.0.1:5000/messages', { content: newMessage }, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    setNewMessage('');
    fetchMessages();
  };

  // Prepare data for graph
  const allMetrics = Array.from(new Set(sessions.flatMap(s => s.progress.map(p => p.metric_name))));
  const progressData = [];
  sessions.forEach(session => {
    session.progress.forEach(p => {
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

  // Calculate progress statistics
  const totalSessions = sessions.length;
  const completedGoals = goals.filter(g => g.achieved).length;
  const totalGoals = goals.length;
  const progressPercentage = totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0;

  return (
    <div style={{ minHeight: '100vh', background: 'transparent', padding: '20px' }}>
      <Container maxWidth="xl">
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
              Patient Dashboard
            </Typography>
            <Typography 
              variant="h6" 
              style={{ 
                color: 'rgba(255, 255, 255, 0.7)',
                fontWeight: '300',
                letterSpacing: '0.5px'
              }}
            >
              Welcome back, {profile?.name || 'Patient'}
            </Typography>
          </div>
          
          <Button 
            variant="outlined" 
            onClick={handleLogout}
            sx={{
              border: '2px solid rgba(255, 68, 68, 0.5)',
              color: '#ff4444',
              fontWeight: '600',
              padding: '12px 24px',
              borderRadius: '12px',
              transition: 'all 0.3s ease',
              '&:hover': {
                border: '2px solid #ff4444',
                background: 'rgba(255, 68, 68, 0.1)',
                transform: 'translateY(-2px)'
              }
            }}
          >
            Logout
          </Button>
        </Box>

        {/* Profile Card */}
        {profile && (
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
                    {profile.name}
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1 }}>
                    {profile.email}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Chip 
                      label={`Age: ${profile.age}`} 
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
        )}

        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card className="glass-card floating-element">
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <TrendingUpIcon sx={{ fontSize: '3rem', color: '#00d4ff', mb: 2 }} />
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
                  {assignedExercises.length}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  Assigned Exercises
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card className="glass-card floating-element" style={{ animationDelay: '1s' }}>
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <CalendarTodayIcon sx={{ fontSize: '3rem', color: '#00ffd4', mb: 2 }} />
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
                  My Goals
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
                        borderRadius: '12px',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          border: '1px solid rgba(0, 212, 255, 0.4)',
                          boxShadow: '0 8px 25px rgba(0, 212, 255, 0.15)'
                        }
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
                
                <Box sx={{ 
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '12px',
                  padding: '20px',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
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
                          color: 'white',
                          '&:hover': {
                            background: 'rgba(255, 255, 255, 0.1)'
                          }
                        }
                      },
                      '& .MuiDayCalendar-weekContainer': {
                        color: 'white',
                        marginBottom: '8px'
                      },
                      '& .MuiPickersDay-root': {
                        color: 'white',
                        fontWeight: '600',
                        fontSize: '0.9rem',
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        margin: '2px',
                        '&:hover': {
                          background: 'rgba(0, 212, 255, 0.3)',
                          color: '#00d4ff',
                          transform: 'scale(1.1)'
                        },
                        '&.Mui-selected': {
                          background: 'linear-gradient(135deg, #667eea, #764ba2)',
                          color: 'white',
                          fontWeight: '700',
                          boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
                        },
                        '&.MuiPickersDay-today': {
                          border: '2px solid #00d4ff',
                          color: '#00d4ff',
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

          {/* Progress Chart */}
          <Grid item xs={12}>
            <Card className="glass-card">
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h5" sx={{ fontWeight: '600', mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TrendingUpIcon sx={{ color: '#00ffd4' }} />
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
                      style: { color: 'rgba(255, 255, 255, 0.7)' }
                    }}
                    InputProps={{
                      style: { color: 'white' }
                    }}
                  >
                    <MenuItem value="">All Metrics</MenuItem>
                    {allMetrics.map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
                  </TextField>
                </Box>
                
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
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </div>
  );
}

export default PatientDashboard;