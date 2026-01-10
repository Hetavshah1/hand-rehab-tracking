import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  Grid,
  Paper,
  IconButton,
  Avatar,
  Chip,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import { styled } from '@mui/material/styles';
import PeopleIcon from '@mui/icons-material/People';
import AssessmentIcon from '@mui/icons-material/Assessment';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';

const GlassContainer = styled(Container)(({ theme }) => ({
  padding: theme.spacing(3),
  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(4),
  },
}));

const StyledCard = styled(Card)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(20px)',
  borderRadius: theme.spacing(2),
  border: '1px solid rgba(255, 255, 255, 0.1)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4)',
    borderColor: 'rgba(0, 212, 255, 0.2)',
  },
}));

const StatCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  background: 'rgba(255, 255, 255, 0.03)',
  backdropFilter: 'blur(10px)',
  borderRadius: theme.spacing(2),
  border: '1px solid rgba(255, 255, 255, 0.1)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: theme.spacing(2),
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-5px)',
    background: 'rgba(255, 255, 255, 0.05)',
    '& .icon': {
      transform: 'scale(1.2)',
    },
  },
}));

const IconWrapper = styled('div')(({ theme }) => ({
  background: 'linear-gradient(45deg, #00d4ff, #ff00d4)',
  borderRadius: '50%',
  padding: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: theme.spacing(2),
  transition: 'all 0.3s ease',
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  padding: theme.spacing(2),
}));

function DoctorDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalPatients: 42,
    activeGoals: 15,
    scheduledSessions: 8,
    progressRate: 92
  });

  // Sample patients data
  const patients = [
    { id: 1, name: 'John Doe', progress: 75, lastSession: '2025-10-25', status: 'Active' },
    { id: 2, name: 'Jane Smith', progress: 60, lastSession: '2025-10-24', status: 'Need Review' },
    { id: 3, name: 'Mike Johnson', progress: 90, lastSession: '2025-10-23', status: 'Active' },
    { id: 4, name: 'Sarah Williams', progress: 45, lastSession: '2025-10-22', status: 'Attention Required' },
  ];

  // Add loading animation class when component mounts
  React.useEffect(() => {
    document.body.classList.add('fade-in');
    return () => document.body.classList.remove('fade-in');
  }, []);

  return (
    <GlassContainer maxWidth="lg">
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              mb: 1,
              background: 'linear-gradient(45deg, #00d4ff, #ff00d4)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Doctor Dashboard
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Monitor your patients' progress and upcoming sessions
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/doctor/patient/new')}
          sx={{
            background: 'linear-gradient(45deg, #00d4ff, #ff00d4)',
            borderRadius: '12px',
            padding: '10px 24px',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 25px rgba(0, 212, 255, 0.4)',
            },
          }}
        >
          Add New Patient
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Quick Stats */}
        <Grid item xs={12} md={3}>
          <StatCard>
            <IconWrapper className="icon">
              <PeopleIcon sx={{ fontSize: 40, color: '#fff' }} />
            </IconWrapper>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {stats.totalPatients}
            </Typography>
            <Typography color="text.secondary">Total Patients</Typography>
          </StatCard>
        </Grid>

        <Grid item xs={12} md={3}>
          <StatCard>
            <IconWrapper className="icon">
              <AssessmentIcon sx={{ fontSize: 40, color: '#fff' }} />
            </IconWrapper>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {stats.activeGoals}
            </Typography>
            <Typography color="text.secondary">Active Goals</Typography>
          </StatCard>
        </Grid>

        <Grid item xs={12} md={3}>
          <StatCard>
            <IconWrapper className="icon">
              <CalendarTodayIcon sx={{ fontSize: 40, color: '#fff' }} />
            </IconWrapper>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {stats.scheduledSessions}
            </Typography>
            <Typography color="text.secondary">Scheduled Sessions</Typography>
          </StatCard>
        </Grid>

        <Grid item xs={12} md={3}>
          <StatCard>
            <IconWrapper className="icon">
              <TrendingUpIcon sx={{ fontSize: 40, color: '#fff' }} />
            </IconWrapper>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {stats.progressRate}%
            </Typography>
            <Typography color="text.secondary">Success Rate</Typography>
          </StatCard>
        </Grid>

        {/* Patient List */}
        <Grid item xs={12}>
          <StyledCard>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3 }}>
                Recent Patients
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <StyledTableCell>Patient</StyledTableCell>
                      <StyledTableCell>Progress</StyledTableCell>
                      <StyledTableCell>Last Session</StyledTableCell>
                      <StyledTableCell>Status</StyledTableCell>
                      <StyledTableCell>Actions</StyledTableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {patients.map((patient) => (
                      <TableRow key={patient.id} hover>
                        <StyledTableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ bgcolor: 'primary.main' }}>
                              {patient.name.charAt(0)}
                            </Avatar>
                            <Typography>{patient.name}</Typography>
                          </Box>
                        </StyledTableCell>
                        <StyledTableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box
                              sx={{
                                width: 100,
                                height: 6,
                                bgcolor: 'rgba(255, 255, 255, 0.1)',
                                borderRadius: 3,
                                overflow: 'hidden',
                              }}
                            >
                              <Box
                                sx={{
                                  width: `${patient.progress}%`,
                                  height: '100%',
                                  background: 'linear-gradient(45deg, #00d4ff, #ff00d4)',
                                  transition: 'width 1s ease-in-out',
                                }}
                              />
                            </Box>
                            <Typography variant="body2">{patient.progress}%</Typography>
                          </Box>
                        </StyledTableCell>
                        <StyledTableCell>{patient.lastSession}</StyledTableCell>
                        <StyledTableCell>
                          <Chip
                            label={patient.status}
                            sx={{
                              bgcolor: patient.status === 'Active' 
                                ? 'rgba(0, 212, 255, 0.1)' 
                                : patient.status === 'Need Review'
                                ? 'rgba(255, 193, 7, 0.1)'
                                : 'rgba(255, 72, 66, 0.1)',
                              color: patient.status === 'Active'
                                ? '#00d4ff'
                                : patient.status === 'Need Review'
                                ? '#ffc107'
                                : '#ff4842',
                              borderRadius: '16px',
                            }}
                          />
                        </StyledTableCell>
                        <StyledTableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title="View Profile">
                              <IconButton 
                                size="small"
                                onClick={() => navigate(`/doctor/patient/${patient.id}`)}
                                sx={{ 
                                  color: 'primary.main',
                                  '&:hover': {
                                    transform: 'translateY(-2px)',
                                  },
                                }}
                              >
                                <VisibilityIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Edit Patient">
                              <IconButton 
                                size="small"
                                onClick={() => navigate(`/doctor/patient/${patient.id}/edit`)}
                                sx={{ 
                                  color: 'secondary.main',
                                  '&:hover': {
                                    transform: 'translateY(-2px)',
                                  },
                                }}
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </StyledTableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </StyledCard>
        </Grid>
      </Grid>
    </GlassContainer>
  );
}

export default DoctorDashboard;