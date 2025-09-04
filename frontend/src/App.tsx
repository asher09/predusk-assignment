import { useState, useEffect } from 'react';
import axios from 'axios';
import Profile from './components/Profile';
import Projects from './components/Projects';
import SearchBar from './components/SearchBar';
import type { Project } from './types';
import './App.css';

function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/projects`);
        setProjects(response.data);
        setFilteredProjects(response.data);
      } catch (err) {
        setError('Failed to fetch projects.');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const handleSearch = async (query: string) => {
    setError(null);
    setLoading(true);
    try {
      if (query) {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/search?q=${query}`);
        setFilteredProjects(response.data.projects);
      } else {
        setFilteredProjects(projects);
      }
    } catch (err) {
      setError('Failed to search projects.');
      setFilteredProjects([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SearchBar onSearch={handleSearch} />
      <Profile />
      {loading && <p>Loading projects...</p>}
      {error && <p>{error}</p>}
      {!loading && !error && <Projects projects={filteredProjects} />}
    </>
  );
}

export default App;
