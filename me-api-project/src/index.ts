// ...removed morgan and rateLimit...
import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './db/pool';

// --- Define interfaces ---
interface Link {
  github_url?: string;
  linkedin_url?: string;
  portfolio_url?: string;
}

interface Education {
  id: number;
  school: string;
  degree: string;
  start_date: string;
  end_date: string;
}

interface WorkExperience {
  id: number;
  company: string;
  position: string;
  description: string;
  start_date: string;
  end_date: string;
}

interface Skill {
  id: number;
  name: string;
}

interface Project {
  id: number;
  title: string;
  description: string;
  project_url?: string;
  github_url?: string;
  skills?: Skill[];
}

interface Profile extends Link {
  id: number;
  name: string;
  email: string;
  projects: Project[];
  skills: Skill[];
  education: Education[];
  work_experience: WorkExperience[];
}

// Configure environment variables
dotenv.config();

const app = express();

// --- Middleware ---

// ...removed logging and rate limiting middleware...

// ...removed basic auth middleware...

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;


app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'UP' });
});

app.get('/profile', async (req: Request, res: Response<Profile | { error: string }>) => {
  try {
    const profileId = 1; // Assuming a single profile for this app

    const profileRes = await pool.query('SELECT * FROM profile WHERE id = $1', [profileId]);
    if (profileRes.rows.length === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const projectsRes = await pool.query('SELECT * FROM projects WHERE profile_id = $1', [profileId]);
    const educationRes = await pool.query('SELECT * FROM education WHERE profile_id = $1', [profileId]);
    const workRes = await pool.query('SELECT * FROM work_experience WHERE profile_id = $1', [profileId]);
    
    const allSkillsRes = await pool.query('SELECT id, name FROM skills');
    
    const profile: Profile = {
      ...profileRes.rows[0],
      projects: projectsRes.rows,
      education: educationRes.rows,
      work_experience: workRes.rows,
      skills: allSkillsRes.rows,
    };

    res.json(profile);
  } catch (err) {
    console.error('Error fetching profile:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new profile
app.post('/profile', async (req: Request, res: Response) => {
  const { name, email, linkedin_url, github_url, portfolio_url, projects } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required.' });
  }
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const insertRes = await client.query(
      `INSERT INTO profile (name, email, linkedin_url, github_url, portfolio_url)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name, email, linkedin_url || null, github_url || null, portfolio_url || null]
    );
    const profile = insertRes.rows[0];

    // Insert projects if provided
    if (Array.isArray(projects)) {
      for (const proj of projects) {
        await client.query(
          `INSERT INTO projects (profile_id, title, description, project_url, github_url)
           VALUES ($1, $2, $3, $4, $5)`,
          [profile.id, proj.title, proj.description, proj.project_url || null, proj.github_url || null]
        );
      }
    }
    await client.query('COMMIT');
    res.status(201).json(profile);
  } catch (err: any) {
    await client.query('ROLLBACK');
    if (err.code === '23505') { // unique_violation
      res.status(409).json({ error: 'A profile with this email already exists.' });
    } else {
      console.error('Error creating profile:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  } finally {
    client.release();
  }
});

app.put('/profile/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, email, linkedin_url, github_url, portfolio_url, projects } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await client.query(
      'UPDATE profile SET name = $1, email = $2, linkedin_url = $3, github_url = $4, portfolio_url = $5 WHERE id = $6 RETURNING *',
      [name, email, linkedin_url, github_url, portfolio_url, id]
    );
    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Replace all projects if provided
    if (Array.isArray(projects)) {
      await client.query('DELETE FROM projects WHERE profile_id = $1', [id]);
      for (const proj of projects) {
        await client.query(
          `INSERT INTO projects (profile_id, title, description, project_url, github_url)
           VALUES ($1, $2, $3, $4, $5)`,
          [id, proj.title, proj.description, proj.project_url || null, proj.github_url || null]
        );
      }
    }
    await client.query('COMMIT');
    res.json(result.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error updating profile:', err);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

app.get('/projects', async (req: Request, res: Response<Project[] | { error: string }>) => {
  const { skill } = req.query;

  try {
    let query = `
      SELECT p.id, p.title, p.description, p.project_url, p.github_url
      FROM projects p
    `;
    const params: any[] = [];
    let paramIndex = 1;

    if (typeof skill === 'string' && skill) {
      query += `
        JOIN project_skills ps ON p.id = ps.project_id
        JOIN skills s ON ps.skill_id = s.id
        WHERE s.name ILIKE $${paramIndex++} AND p.profile_id = 1
      `;
      params.push(skill);
    } else {
        query += ' WHERE p.profile_id = 1';
    }

  // ...removed pagination...

    const projectsResult = await pool.query(query, params);
    res.json(projectsResult.rows);
  } catch (err) {
    console.error('Error fetching projects:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/skills/top', async (req: Request, res: Response) => {
    try {
        const result = await pool.query(`
            SELECT s.id, s.name, COUNT(ps.project_id) as project_count
            FROM skills s
            JOIN project_skills ps ON s.id = ps.skill_id
            GROUP BY s.id, s.name
            ORDER BY project_count DESC
            LIMIT 5
        `);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching top skills:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/search', async (req: Request, res: Response) => {
    const { q } = req.query;
    if (!q || typeof q !== 'string') {
        return res.status(400).json({ error: 'Query parameter "q" is required.' });
    }

    try {
        const projectsPromise = pool.query(
            "SELECT id, title, description FROM projects WHERE (title ILIKE $1 OR description ILIKE $1) AND profile_id = 1",
            [`%${q}%`]
        );
        const skillsPromise = pool.query(
            "SELECT id, name FROM skills WHERE name ILIKE $1",
            [`%${q}%`]
        );

        const [projectsResult, skillsResult] = await Promise.all([projectsPromise, skillsPromise]);

        res.json({
            projects: projectsResult.rows,
            skills: skillsResult.rows,
        });
    } catch (err) {
        console.error('Error during search:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

