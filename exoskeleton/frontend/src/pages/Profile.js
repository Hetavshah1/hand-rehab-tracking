import React, { useEffect, useState } from 'react';
import axios from 'axios';

function Profile() {
  const [profile, setProfile] = useState(null);
  const [role, setRole] = useState(localStorage.getItem('role'));

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        if (role === 'doctor') {
          const res = await axios.get('http://127.0.0.1:5000/me', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setProfile(res.data);
        } else {
          const res = await axios.get('http://127.0.0.1:5000/profile', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setProfile(res.data);
        }
      } catch (err) {}
    };
    fetchProfile();
  }, [role]);

  if (!profile) return <div>Loading...</div>;

  return (
    <div className="profile-page">
      <h2>Profile</h2>
      <p>Name: {profile.name}</p>
      <p>Email: {profile.email}</p>
      {role === 'patient' && (
        <>
          <p>Age: {profile.age}</p>
          <p>Diagnosis: {profile.diagnosis}</p>
        </>
      )}
    </div>
  );
}

export default Profile; 