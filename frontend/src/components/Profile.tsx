import React, { useState, useEffect } from 'react';
import axios from 'axios';
import type { Profile as ProfileType } from '../types';

const Profile: React.FC = () => {
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/profile`);
        setProfile(response.data);
      } catch (err) {
        setError('Failed to fetch profile data.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) return <p>Loading profile...</p>;
  if (error) return <p>{error}</p>;
  if (!profile) return <p>No profile data available.</p>;

  return (
    <div>
      <h2>{profile.name}</h2>
      <p>{profile.headline}</p>
      <p>{profile.location}</p>
      <p>{profile.summary}</p>
    </div>
  );
};

export default Profile;
