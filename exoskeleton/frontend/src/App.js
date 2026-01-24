import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { theme } from './theme';
import Login from './pages/Login.new';
import Signup from './pages/Signup';
import DoctorDashboard from './pages/DoctorDashboard.new';
import PatientDashboard from './pages/PatientDashboard.new';
import Profile from './pages/Profile';
import DoctorPatientProfile from './pages/DoctorPatientProfile.new';
import NewPatient from './pages/NewPatient.new';
import EditPatient from './pages/EditPatient.new';
import Sessions from './pages/Sessions.new';
import SessionDetail from './pages/SessionDetail.new';
// Remap mode screens:
// mode1 => Exoskeleton (Mode4 component)
// mode2 => Optical sensing (Mode3 component)
// mode3 => Flex sensor (Mode2 component)
// mode4 => Video guided (Mode1 component)
import Mode4 from './pages/Mode1.new'; // used as Mode 4 (video guided)
import Mode3 from './pages/Mode2.new'; // used as Mode 3 (flex sensor)
import Mode2 from './pages/Mode3.new'; // used as Mode 2 (optical)
import Mode1 from './pages/Mode4.new'; // used as Mode 1 (exoskeleton)
import ExerciseLibrary from './pages/ExerciseLibrary.new';
import Page from './components/Page';
import MyAppBar from './components/AppBar';
import './App.css';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Router>
          <div className="app-background">
            <MyAppBar />
            <Routes>
              <Route path="/" element={<Navigate to="/login" />} />
              <Route path="/login" element={<Page><Login /></Page>} />
              <Route path="/signup" element={<Page><Signup /></Page>} />
              <Route path="/doctor/*" element={<Page><DoctorDashboard /></Page>} />
              <Route path="/doctor/patient/new" element={<Page><NewPatient /></Page>} />
              <Route path="/doctor/patient/:id/edit" element={<Page><EditPatient /></Page>} />
              <Route path="/doctor/patient/:id" element={<Page><DoctorPatientProfile /></Page>} />
              <Route path="/doctor/patient/:id/sessions" element={<Page><Sessions /></Page>} />
              <Route path="/exercise/:id/mode1" element={<Page><Mode1 /></Page>} />
              <Route path="/exercise/:id/mode2" element={<Page><Mode2 /></Page>} />
              <Route path="/exercise/:id/mode3" element={<Page><Mode3 /></Page>} />
              <Route path="/exercise/:id/mode4" element={<Page><Mode4 /></Page>} />
              <Route path="/exercises" element={<Page><ExerciseLibrary /></Page>} />
              <Route path="/patient/*" element={<Page><PatientDashboard /></Page>} />
              <Route path="/patient/sessions" element={<Page><Sessions /></Page>} />
              <Route path="/patient/session/:id" element={<Page><SessionDetail /></Page>} />
              <Route path="/profile" element={<Page><Profile /></Page>} />
            </Routes>
          </div>
        </Router>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;
