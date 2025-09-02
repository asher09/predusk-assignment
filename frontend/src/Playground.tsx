import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface TopSkill {
  id: number;
  name: string;
  project_count: number;
}

interface Profile {
  id: number;
  name: string;
  email: string;
  projects?: Project[];
}

interface Project {
  id: number;
  title: string;
  description: string;
  skills?: { id?: number; name: string }[];
}

const Playground: React.FC = () => {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const [profile, setProfile] = useState<Profile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [skill, setSkill] = useState('');
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<{ projects: Project[]; skills: { id: number; name: string }[] } | null>(null);
  const [activeSection, setActiveSection] = useState<'topSkills' | 'projects' | 'search'>('topSkills');
  const [newProject, setNewProject] = useState<{ title: string; description: string; skills: string }>({ title: '', description: '', skills: '' });
  // Helper to generate a temporary id for new projects (for React key)
  const tempId = () => Date.now() + Math.random();
  const [adding, setAdding] = useState(false);
  const [topSkills, setTopSkills] = useState<TopSkill[]>([]);

  // Fetch top skills on mount (after apiUrl is defined)
  useEffect(() => {
    const fetchTopSkills = async () => {
      try {
        const response = await axios.get(`${apiUrl}/skills/top`);
        setTopSkills(response.data);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error fetching top skills:', error);
      }
    };
    fetchTopSkills();
  }, [apiUrl]);

  // Fetch projects filtered by skill
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (skill) {
          const response = await axios.get(`${apiUrl}/projects?skill=${skill}`);
          setProjects(response.data);
        } else if (!profile) {
          const response = await axios.get(`${apiUrl}/profile`);
          setProfile(response.data);
          setProjects(response.data.projects || []);
        } else {
          setProjects(profile.projects || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, [skill, apiUrl, profile]);

  // Fetch search results for /search?q=
  useEffect(() => {
    const fetchSearch = async () => {
      if (!search) {
        setSearchResults(null);
        return;
      }
      try {
        const response = await axios.get(`${apiUrl}/search?q=${encodeURIComponent(search)}`);
        setSearchResults(response.data);
      } catch (error) {
        setSearchResults(null);
        // eslint-disable-next-line no-console
        console.error('Error searching:', error);
      }
    };
    fetchSearch();
  }, [search, apiUrl]);

  const renderProfile = () => {
    if (!profile) {
      return <p>Loading profile...</p>;
    }
    return (
      <div>
        <h2>{profile.name}</h2>
        <p>{profile.email}</p>
      </div>
    );
  };

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    if (!newProject.title.trim() || !newProject.description.trim()) return;
    setAdding(true);
    try {
      // Add new project to backend by updating the profile
      // Parse skills string into array of { name }
      const skillsArr = newProject.skills
        ? newProject.skills.split(',').map(s => ({ name: s.trim() })).filter(s => s.name)
        : [];
      const newProj: Project = { id: tempId(), title: newProject.title, description: newProject.description, skills: skillsArr };
      const updatedProjects: Project[] = [ ...(profile.projects || []), newProj ];
      await axios.put(`${apiUrl}/profile/${profile.id}`, {
        name: profile.name,
        email: profile.email,
        projects: updatedProjects.map(({ id, skills, ...rest }) => ({ ...rest, skills })),
      });
      setProjects(updatedProjects);
      setProfile({ ...profile, projects: updatedProjects });
      setNewProject({ title: '', description: '', skills: '' });
    } catch (err) {
      alert('Failed to add project');
    } finally {
      setAdding(false);
    }
  };

  const renderProjects = () => (
    <div>
      <table border={1} cellPadding={6} style={{ width: '100%', marginTop: 10 }}>
        <thead>
          <tr>
            <th>Title</th>
            <th>Description</th>
            <th>Skills</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project, idx) => (
            <tr key={project.id ?? idx}>
              <td>{project.title}</td>
              <td>{project.description}</td>
              <td>
                {project.skills && project.skills.length > 0
                  ? project.skills.map((s) => s.name).join(', ')
                  : '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <form onSubmit={handleAddProject} style={{ marginTop: 16 }}>
        <input
          type="text"
          placeholder="Project Title"
          value={newProject.title}
          onChange={e => setNewProject({ ...newProject, title: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Project Description"
          value={newProject.description}
          onChange={e => setNewProject({ ...newProject, description: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Skills (comma separated)"
          value={newProject.skills}
          onChange={e => setNewProject({ ...newProject, skills: e.target.value })}
        />
        <button type="submit" disabled={adding} style={{ marginLeft: 8 }}>
          {adding ? 'Adding...' : 'Add Project'}
        </button>
      </form>
    </div>
  );

  return (
    <div>
      <h1>Me-API Playground</h1>
      {renderProfile()}
      <hr />
      <div style={{ marginBottom: 24 }}>
        <button onClick={() => setActiveSection('topSkills')} style={{ marginRight: 8, fontWeight: activeSection === 'topSkills' ? 'bold' : 'normal' }}>Top Skills</button>
        <button onClick={() => setActiveSection('projects')} style={{ marginRight: 8, fontWeight: activeSection === 'projects' ? 'bold' : 'normal' }}>Projects</button>
        <button onClick={() => setActiveSection('search')} style={{ fontWeight: activeSection === 'search' ? 'bold' : 'normal' }}>Search</button>
      </div>

      {activeSection === 'topSkills' && (
        <div>
          <h2>Top Skills (from /skills/top)</h2>
          <table border={1} cellPadding={6} style={{ width: '100%', marginBottom: 20 }}>
            <thead>
              <tr>
                <th>Skill</th>
                <th>Project Count</th>
              </tr>
            </thead>
            <tbody>
              {topSkills.map(skill => (
                <tr key={skill.id}>
                  <td>{skill.name}</td>
                  <td>{skill.project_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeSection === 'projects' && (
        <div>
          <h2>Projects (filtered by /projects?skill=...)</h2>
          <input
            type="text"
            value={skill}
            onChange={(e) => setSkill(e.target.value)}
            placeholder="Filter by skill..."
          />
          {renderProjects()}
        </div>
      )}

      {activeSection === 'search' && (
        <div>
          <h2>Search (from /search?q=...)</h2>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search projects and skills..."
            style={{ marginBottom: 10 }}
          />
          {searchResults && (
            <div>
              <h3>Projects</h3>
              {searchResults.projects.length === 0 ? <p>No projects found.</p> : (
                <ul>
                  {searchResults.projects.map((p) => (
                    <li key={p.id}>{p.title} - {p.description}</li>
                  ))}
                </ul>
              )}
              <h3>Skills</h3>
              {searchResults.skills.length === 0 ? <p>No skills found.</p> : (
                <ul>
                  {searchResults.skills.map((s) => (
                    <li key={s.id}>{s.name}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Playground;
