import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  Card, CardContent, Typography, Button, Box, Grid, TextField, Dialog, 
  DialogTitle, DialogContent, DialogActions, IconButton, List, ListItem, 
  ListItemText, MenuItem, Chip, Avatar, Alert, Fab
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import PeopleIcon from '@mui/icons-material/People';
import AssignmentIcon from '@mui/icons-material/Assignment';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import DashboardIcon from '@mui/icons-material/Dashboard';

function DoctorDashboard() {
  const [patients, setPatients] = useState([]);
  const [unassigned, setUnassigned] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [exerciseDialogOpen, setExerciseDialogOpen] = useState(false);
  const [exerciseForm, setExerciseForm] = useState({ name: '', description: '', video_url: '', image_url: '' });
  const [editExerciseId, setEditExerciseId] = useState(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [assignPatientId, setAssignPatientId] = useState(null);
  const [assignExerciseId, setAssignExerciseId] = useState('');
  const [assignNotes, setAssignNotes] = useState('');
  const [assignedExercises, setAssignedExercises] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://127.0.0.1:5000/patients', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setPatients(res.data);
    } catch (err) {
      if (err.response && err.response.status === 403) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchUnassigned = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:5000/patients/unassigned', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setUnassigned(res.data);
    } catch (err) {}
  };

  const fetchExercises = async () => {
    const res = await axios.get('http://127.0.0.1:5000/exercises', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    setExercises(res.data);
  };

  const fetchAssignedExercises = async (patientId) => {
    const res = await axios.get(`http://127.0.0.1:5000/patients/${patientId}/assigned_exercises`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    setAssignedExercises(res.data);
  };

  useEffect(() => {
    fetchPatients();
    fetchUnassigned();
    fetchExercises();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const handleAssign = async (id) => {
    await axios.post(`http://127.0.0.1:5000/patients/${id}/assign`, {}, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    fetchPatients();
    fetchUnassigned();
  };

  const handleOpenExerciseDialog = (ex = null) => {
    if (ex) {
      setExerciseForm(ex);
      setEditExerciseId(ex.id);
    } else {
      setExerciseForm({ name: '', description: '', video_url: '', image_url: '' });
      setEditExerciseId(null);
    }
    setExerciseDialogOpen(true);
  };

  const handleCloseExerciseDialog = () => setExerciseDialogOpen(false);
  const handleExerciseFormChange = (e) => setExerciseForm(f => ({ ...f, [e.target.name]: e.target.value }));
  
  const handleSaveExercise = async () => {
    if (editExerciseId) {
      await axios.put(`http://127.0.0.1:5000/exercises/${editExerciseId}`, exerciseForm, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
    } else {
      await axios.post('http://127.0.0.1:5000/exercises', exerciseForm, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
    }
    fetchExercises();
    setExerciseDialogOpen(false);
  };

  const handleDeleteExercise = async (id) => {
    await axios.delete(`http://127.0.0.1:5000/exercises/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    fetchExercises();
  };

  const handleOpenAssignDialog = (patientId) => {
    setAssignPatientId(patientId);
    setAssignExerciseId('');
    setAssignNotes('');
    setAssignDialogOpen(true);
    fetchAssignedExercises(patientId);
  };

  const handleCloseAssignDialog = () => setAssignDialogOpen(false);
  
  const handleAssignExercise = async () => {
    await axios.post(`http://127.0.0.1:5000/patients/${assignPatientId}/assign_exercise`, {
      exercise_id: assignExerciseId,
      notes: assignNotes
    }, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    fetchAssignedExercises(assignPatientId);
  };

  // Calculate statistics
  const totalPatients = patients.length;
  const totalUnassigned = unassigned.length;
  const totalExercises = exercises.length;
  const totalAssignments = assignedExercises.length;

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
              Doctor Dashboard
            </Typography>
            <Typography 
              variant="h6" 
              style={{ 
                color: 'rgba(255, 255, 255, 0.7)',
                fontWeight: '300',
                letterSpacing: '0.5px'
              }}
            >
              Advanced Patient Management System
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

        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card className="glass-card floating-element">
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <PeopleIcon sx={{ fontSize: '3rem', color: '#00d4ff', mb: 2 }} />
                <Typography variant="h4" sx={{ fontWeight: '700', mb: 1 }}>
                  {totalPatients}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  My Patients
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card className="glass-card floating-element" style={{ animationDelay: '0.5s' }}>
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <PersonAddIcon sx={{ fontSize: '3rem', color: '#ff00d4', mb: 2 }} />
                <Typography variant="h4" sx={{ fontWeight: '700', mb: 1 }}>
                  {totalUnassigned}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  Unassigned Patients
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card className="glass-card floating-element" style={{ animationDelay: '1s' }}>
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <FitnessCenterIcon sx={{ fontSize: '3rem', color: '#00ffd4', mb: 2 }} />
                <Typography variant="h4" sx={{ fontWeight: '700', mb: 1 }}>
                  {totalExercises}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  Exercise Library
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card className="glass-card floating-element" style={{ animationDelay: '1.5s' }}>
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <AssignmentIcon sx={{ fontSize: '3rem', color: '#d400ff', mb: 2 }} />
                <Typography variant="h4" sx={{ fontWeight: '700', mb: 1 }}>
                  {totalAssignments}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  Total Assignments
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Main Content Grid */}
        <Grid container spacing={4}>
          {/* My Patients Section */}
          <Grid item xs={12} md={6}>
            <Card className="glass-card">
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h5" sx={{ fontWeight: '600', mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PeopleIcon sx={{ color: '#00d4ff' }} />
                  My Patients
                </Typography>
                
                {loading ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <div className="loading-spinner" style={{ margin: '0 auto' }} />
                    <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)', mt: 2 }}>
                      Loading patients...
                    </Typography>
                  </Box>
                ) : patients.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                      No patients assigned yet
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {patients.map(p => (
                      <Card key={p.id} sx={{ 
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '12px',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          border: '1px solid rgba(0, 212, 255, 0.3)',
                          boxShadow: '0 8px 25px rgba(0, 212, 255, 0.1)'
                        }
                      }}>
                        <CardContent sx={{ p: 3 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Avatar sx={{ 
                                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                                width: 40,
                                height: 40
                              }}>
                                <PeopleIcon />
                              </Avatar>
                              <Box>
                                <Typography variant="h6" sx={{ fontWeight: '500' }}>
                                  {p.name}
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                                  {p.email}
                                </Typography>
                              </Box>
                            </Box>
                            <Button
                              variant="contained"
                              onClick={() => navigate(`/doctor/patient/${p.id}`)}
                              sx={{
                                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                                borderRadius: '8px',
                                textTransform: 'none',
                                fontWeight: '500',
                                '&:hover': {
                                  transform: 'translateY(-1px)',
                                  boxShadow: '0 5px 15px rgba(102, 126, 234, 0.4)'
                                }
                              }}
                            >
                              View Profile
                            </Button>
                          </Box>
                        </CardContent>
                      </Card>
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Unassigned Patients Section */}
          <Grid item xs={12} md={6}>
            <Card className="glass-card">
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h5" sx={{ fontWeight: '600', mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PersonAddIcon sx={{ color: '#ff00d4' }} />
                  Unassigned Patients
                </Typography>
                
                {unassigned.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                      All patients are assigned
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {unassigned.map(p => (
                      <Card key={p.id} sx={{ 
                        background: 'rgba(255, 0, 212, 0.05)',
                        border: '1px solid rgba(255, 0, 212, 0.2)',
                        borderRadius: '12px',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          border: '1px solid rgba(255, 0, 212, 0.4)',
                          boxShadow: '0 8px 25px rgba(255, 0, 212, 0.1)'
                        }
                      }}>
                        <CardContent sx={{ p: 3 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Avatar sx={{ 
                                background: 'linear-gradient(135deg, #ff00d4, #d400ff)',
                                width: 40,
                                height: 40
                              }}>
                                <PersonAddIcon />
                              </Avatar>
                              <Box>
                                <Typography variant="h6" sx={{ fontWeight: '500' }}>
                                  {p.name}
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                                  {p.email}
                                </Typography>
                              </Box>
                            </Box>
                            <Button
                              variant="contained"
                              onClick={() => handleAssign(p.id)}
                              sx={{
                                background: 'linear-gradient(135deg, #ff00d4, #d400ff)',
                                borderRadius: '8px',
                                textTransform: 'none',
                                fontWeight: '500',
                                '&:hover': {
                                  transform: 'translateY(-1px)',
                                  boxShadow: '0 5px 15px rgba(255, 0, 212, 0.4)'
                                }
                              }}
                            >
                              Assign to Me
                            </Button>
                          </Box>
                        </CardContent>
                      </Card>
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Exercise Library Section */}
          <Grid item xs={12}>
            <Card className="glass-card">
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h5" sx={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FitnessCenterIcon sx={{ color: '#00ffd4' }} />
                    Exercise Library
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={() => handleOpenExerciseDialog()}
                    sx={{
                      background: 'linear-gradient(135deg, #00ffd4, #00d4ff)',
                      borderRadius: '12px',
                      textTransform: 'none',
                      fontWeight: '600',
                      padding: '12px 24px',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 25px rgba(0, 255, 212, 0.3)'
                      }
                    }}
                  >
                    <AddIcon sx={{ mr: 1 }} />
                    Add Exercise
                  </Button>
                </Box>
                
                <Grid container spacing={3}>
                  {exercises.map(ex => (
                    <Grid item xs={12} sm={6} md={4} key={ex.id}>
                      <Card sx={{ 
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '15px',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-5px)',
                          border: '1px solid rgba(0, 255, 212, 0.3)',
                          boxShadow: '0 15px 35px rgba(0, 255, 212, 0.1)'
                        }
                      }}>
                        <CardContent sx={{ p: 3 }}>
                          <Typography variant="h6" sx={{ fontWeight: '600', mb: 2 }}>
                            {ex.name}
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 2 }}>
                            {ex.description}
                          </Typography>
                          
                          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                            {ex.video_url && (
                              <Chip 
                                label="Video" 
                                size="small"
                                sx={{ 
                                  background: 'rgba(0, 212, 255, 0.2)',
                                  color: '#00d4ff',
                                  border: '1px solid rgba(0, 212, 255, 0.3)'
                                }} 
                              />
                            )}
                            {ex.image_url && (
                              <Chip 
                                label="Image" 
                                size="small"
                                sx={{ 
                                  background: 'rgba(255, 0, 212, 0.2)',
                                  color: '#ff00d4',
                                  border: '1px solid rgba(255, 0, 212, 0.3)'
                                }} 
                              />
                            )}
                          </Box>
                          
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <IconButton 
                              onClick={() => handleOpenExerciseDialog(ex)}
                              sx={{ 
                                color: '#00d4ff',
                                '&:hover': { background: 'rgba(0, 212, 255, 0.1)' }
                              }}
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton 
                              onClick={() => handleDeleteExercise(ex.id)}
                              sx={{ 
                                color: '#ff4444',
                                '&:hover': { background: 'rgba(255, 68, 68, 0.1)' }
                              }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Exercise Assignment Section */}
          <Grid item xs={12}>
            <Card className="glass-card">
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h5" sx={{ fontWeight: '600', mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AssignmentIcon sx={{ color: '#d400ff' }} />
                  Exercise Assignment
                </Typography>
                
                <Grid container spacing={3}>
                  {patients.map(p => (
                    <Grid item xs={12} sm={6} md={4} key={p.id}>
                      <Card sx={{ 
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '12px',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          border: '1px solid rgba(212, 0, 255, 0.3)',
                          boxShadow: '0 8px 25px rgba(212, 0, 255, 0.1)'
                        }
                      }}>
                        <CardContent sx={{ p: 3 }}>
                          <Typography variant="h6" sx={{ fontWeight: '500', mb: 1 }}>
                            {p.name}
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 2 }}>
                            {p.email}
                          </Typography>
                          <Button
                            variant="outlined"
                            onClick={() => handleOpenAssignDialog(p.id)}
                            sx={{
                              border: '1px solid rgba(212, 0, 255, 0.5)',
                              color: '#d400ff',
                              borderRadius: '8px',
                              textTransform: 'none',
                              fontWeight: '500',
                              width: '100%',
                              '&:hover': {
                                border: '1px solid #d400ff',
                                background: 'rgba(212, 0, 255, 0.1)',
                                transform: 'translateY(-1px)'
                              }
                            }}
                          >
                            Assign/View Exercises
                          </Button>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Exercise Dialog */}
        <Dialog 
          open={exerciseDialogOpen} 
          onClose={handleCloseExerciseDialog}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              background: 'rgba(0, 0, 0, 0.9)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '20px'
            }
          }}
        >
          <DialogTitle sx={{ 
            color: 'white', 
            fontWeight: '600',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            pb: 2
          }}>
            {editExerciseId ? 'Edit Exercise' : 'Add New Exercise'}
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField 
                label="Exercise Name" 
                name="name" 
                value={exerciseForm.name} 
                onChange={handleExerciseFormChange} 
                fullWidth
                className="futuristic-input"
                InputLabelProps={{
                  style: { color: 'rgba(255, 255, 255, 0.7)' }
                }}
                InputProps={{
                  style: { color: 'white' }
                }}
              />
              <TextField 
                label="Description" 
                name="description" 
                value={exerciseForm.description} 
                onChange={handleExerciseFormChange} 
                fullWidth
                multiline
                rows={3}
                className="futuristic-input"
                InputLabelProps={{
                  style: { color: 'rgba(255, 255, 255, 0.7)' }
                }}
                InputProps={{
                  style: { color: 'white' }
                }}
              />
              <TextField 
                label="Video URL" 
                name="video_url" 
                value={exerciseForm.video_url} 
                onChange={handleExerciseFormChange} 
                fullWidth
                className="futuristic-input"
                InputLabelProps={{
                  style: { color: 'rgba(255, 255, 255, 0.7)' }
                }}
                InputProps={{
                  style: { color: 'white' }
                }}
              />
              <TextField 
                label="Image URL" 
                name="image_url" 
                value={exerciseForm.image_url} 
                onChange={handleExerciseFormChange} 
                fullWidth
                className="futuristic-input"
                InputLabelProps={{
                  style: { color: 'rgba(255, 255, 255, 0.7)' }
                }}
                InputProps={{
                  style: { color: 'white' }
                }}
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3, borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <Button 
              onClick={handleCloseExerciseDialog}
              sx={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontWeight: '500'
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveExercise} 
              variant="contained"
              className="futuristic-btn"
              sx={{
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                fontWeight: '600',
                textTransform: 'none',
                padding: '10px 24px'
              }}
            >
              {editExerciseId ? 'Update Exercise' : 'Create Exercise'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Assignment Dialog */}
        <Dialog 
          open={assignDialogOpen} 
          onClose={handleCloseAssignDialog} 
          maxWidth="sm" 
          fullWidth
          PaperProps={{
            sx: {
              background: 'rgba(0, 0, 0, 0.9)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '20px'
            }
          }}
        >
          <DialogTitle sx={{ 
            color: 'white', 
            fontWeight: '600',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            pb: 2
          }}>
            Assign Exercise
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField 
                select 
                label="Exercise" 
                value={assignExerciseId} 
                onChange={e => setAssignExerciseId(e.target.value)} 
                fullWidth
                className="futuristic-input"
                InputLabelProps={{
                  style: { color: 'rgba(255, 255, 255, 0.7)' }
                }}
                InputProps={{
                  style: { color: 'white' }
                }}
              >
                {exercises.map(ex => (
                  <MenuItem key={ex.id} value={ex.id}>{ex.name}</MenuItem>
                ))}
              </TextField>
              <TextField 
                label="Notes" 
                value={assignNotes} 
                onChange={e => setAssignNotes(e.target.value)} 
                fullWidth
                multiline
                rows={3}
                className="futuristic-input"
                InputLabelProps={{
                  style: { color: 'rgba(255, 255, 255, 0.7)' }
                }}
                InputProps={{
                  style: { color: 'white' }
                }}
              />
              
              <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: '500', mt: 2 }}>
                Currently Assigned Exercises:
              </Typography>
              <List sx={{ maxHeight: 200, overflow: 'auto' }}>
                {assignedExercises.map(ae => (
                  <ListItem key={ae.id} sx={{ 
                    background: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: '8px',
                    mb: 1
                  }}>
                    <ListItemText 
                      primary={ae.exercise.name} 
                      secondary={ae.notes}
                      primaryTypographyProps={{ color: 'white', fontWeight: '500' }}
                      secondaryTypographyProps={{ color: 'rgba(255, 255, 255, 0.7)' }}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3, borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <Button 
              onClick={handleCloseAssignDialog}
              sx={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontWeight: '500'
              }}
            >
              Close
            </Button>
            <Button 
              onClick={handleAssignExercise} 
              variant="contained"
              className="futuristic-btn"
              sx={{
                background: 'linear-gradient(135deg, #d400ff, #ff00d4)',
                fontWeight: '600',
                textTransform: 'none',
                padding: '10px 24px'
              }}
            >
              Assign Exercise
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </div>
  );
}

export default DoctorDashboard;