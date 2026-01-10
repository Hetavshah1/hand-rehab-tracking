import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Button,
  Avatar,
  IconButton,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import TimelineIcon from '@mui/icons-material/Timeline';
import EventNoteIcon from '@mui/icons-material/EventNote';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import StarIcon from '@mui/icons-material/Star';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
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

const ProgressCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  background: 'rgba(255, 255, 255, 0.03)',
  backdropFilter: 'blur(10px)',
  borderRadius: theme.spacing(2),
  border: '1px solid rgba(255, 255, 255, 0.1)',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: 'linear-gradient(90deg, #00d4ff, #ff00d4)',
  },
}));

const GradientText = styled(Typography)(({ theme }) => ({
  background: 'linear-gradient(45deg, #00d4ff, #ff00d4)',
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  fontWeight: 700,
}));

const StyledLinearProgress = styled(LinearProgress)(({ theme }) => ({
  height: 10,
  borderRadius: 5,
  [`&.MuiLinearProgress-colorPrimary`]: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  [`& .MuiLinearProgress-bar`]: {
    borderRadius: 5,
    background: 'linear-gradient(45deg, #00d4ff, #ff00d4)',
  },
}));

const AchievementChip = styled(Chip)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.05)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '16px',
  '& .MuiChip-icon': {
    color: theme.palette.primary.main,
  },
}));
function PatientDashboard() {
  const navigate = useNavigate();
  const [patientData] = useState({
    name: 'John Doe',
    progress: 75,
    nextSession: '2025-10-30',
    totalSessions: 24,
    completedSessions: 18,
    currentGoals: [
      { id: 1, title: 'Increase Walking Distance', progress: 80 },
      { id: 2, title: 'Improve Balance Control', progress: 65 },
      { id: 3, title: 'Strengthen Core Muscles', progress: 45 },
    ],
    recentAchievements: [
      { id: 1, title: '5km Walk Milestone', date: '2025-10-25' },
      { id: 2, title: 'Balance Test Level 3', date: '2025-10-22' },
      { id: 3, title: '20 Sessions Completed', date: '2025-10-20' },
    ],
    weeklyActivity: [
      { day: 'Mon', minutes: 45 },
      { day: 'Tue', minutes: 30 },
      { day: 'Wed', minutes: 60 },
      { day: 'Thu', minutes: 40 },
      { day: 'Fri', minutes: 50 },
      { day: 'Sat', minutes: 20 },
      { day: 'Sun', minutes: 35 },
    ],
  });

  return (
    <GlassContainer maxWidth="lg">
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <GradientText variant="h4" sx={{ mb: 1 }}>
          Welcome back, {patientData.name}
        </GradientText>
        <Typography variant="subtitle1" color="text.secondary">
          Your recovery journey is {patientData.progress}% complete
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Progress Overview */}
        <Grid item xs={12} md={8}>
          <StyledCard>
            <CardContent>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Overall Progress
                </Typography>
                <StyledLinearProgress
                  variant="determinate"
                  value={patientData.progress}
                  sx={{ mb: 1 }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    {patientData.completedSessions} of {patientData.totalSessions} sessions completed
                  </Typography>
                  <Typography variant="body2" color="primary">
                    {patientData.progress}%
                  </Typography>
                </Box>
              </Box>

              <Typography variant="h6" sx={{ mb: 2 }}>
                Current Goals
              </Typography>
              <Grid container spacing={2}>
                {patientData.currentGoals.map((goal) => (
                  <Grid item xs={12} key={goal.id}>
                    <ProgressCard>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle1">{goal.title}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Progress: {goal.progress}%
                        </Typography>
                      </Box>
                      <StyledLinearProgress
                        variant="determinate"
                        value={goal.progress}
                      />
                    </ProgressCard>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </StyledCard>
        </Grid>

        {/* Achievements */}
        <Grid item xs={12} md={4}>
          <StyledCard sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3 }}>
                Recent Achievements
              </Typography>
              <List>
                {patientData.recentAchievements.map((achievement) => (
                  <ListItem
                    key={achievement.id}
                    sx={{
                      mb: 2,
                      background: 'rgba(255, 255, 255, 0.03)',
                      borderRadius: 2,
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                  >
                    <ListItemIcon>
                      <EmojiEventsIcon sx={{ color: '#00d4ff' }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={achievement.title}
                      secondary={achievement.date}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </StyledCard>
        </Grid>

        {/* Weekly Activity */}
        <Grid item xs={12}>
          <StyledCard>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3 }}>
                Weekly Activity
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                {patientData.weeklyActivity.map((day) => (
                  <Box
                    key={day.day}
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                    }}
                  >
                    <Box
                      sx={{
                        height: 100,
                        width: 20,
                        background: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '10px',
                        position: 'relative',
                        mb: 1,
                      }}
                    >
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          height: `${(day.minutes / 60) * 100}%`,
                          background: 'linear-gradient(180deg, #00d4ff, #ff00d4)',
                          borderRadius: '10px',
                          transition: 'height 1s ease-in-out',
                        }}
                      />
                    </Box>
                    <Typography variant="caption">{day.day}</Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </StyledCard>
        </Grid>

        {/* Next Session */}
        <Grid item xs={12}>
          <StyledCard
            sx={{
              background: 'linear-gradient(45deg, rgba(0, 212, 255, 0.1), rgba(255, 0, 212, 0.1))',
            }}
          >
            <CardContent>
              <Grid container alignItems="center" spacing={2}>
                <Grid item xs={12} sm={8}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar
                      sx={{
                        background: 'linear-gradient(45deg, #00d4ff, #ff00d4)',
                        width: 56,
                        height: 56,
                      }}
                    >
                      <EventNoteIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h6">Next Session</Typography>
                      <Typography variant="subtitle1" color="text.secondary">
                        {patientData.nextSession}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4} sx={{ textAlign: 'right' }}>
                  <Button
                    variant="contained"
                    endIcon={<ArrowForwardIcon />}
                    onClick={() => navigate('/patient/sessions')}
                    sx={{
                      background: 'linear-gradient(45deg, #00d4ff, #ff00d4)',
                      borderRadius: '12px',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 25px rgba(0, 212, 255, 0.4)',
                      },
                    }}
                  >
                    View Details
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </StyledCard>
        </Grid>
      </Grid>
    </GlassContainer>
  );
}

export default PatientDashboard;