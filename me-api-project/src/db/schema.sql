-- Drop existing tables to start fresh
DROP TABLE IF EXISTS project_skills, education, work_experience, skills, projects, profile;

-- Profile Table
CREATE TABLE profile (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  linkedin_url VARCHAR(255),
  github_url VARCHAR(255),
  portfolio_url VARCHAR(255)
);

-- Projects Table
CREATE TABLE projects (
  id SERIAL PRIMARY KEY,
  profile_id INTEGER REFERENCES profile(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT
);

-- Skills Table
CREATE TABLE skills (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL
);

-- Project-Skills Join Table
CREATE TABLE project_skills (
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  skill_id INTEGER REFERENCES skills(id) ON DELETE CASCADE,
  PRIMARY KEY (project_id, skill_id)
);

-- Education Table
CREATE TABLE education (
  id SERIAL PRIMARY KEY,
  profile_id INTEGER REFERENCES profile(id) ON DELETE CASCADE,
  school VARCHAR(255) NOT NULL,
  degree VARCHAR(255),
  start_date DATE,
  end_date DATE
);

-- Work Experience Table
CREATE TABLE work_experience (
  id SERIAL PRIMARY KEY,
  profile_id INTEGER REFERENCES profile(id) ON DELETE CASCADE,
  company VARCHAR(255) NOT NULL,
  position VARCHAR(255),
  description TEXT,
  start_date DATE,
  end_date DATE
);
