
import { Request, Response } from 'express';
import pool from '../db/pool';
import { Profile } from '../types';

export const getProfile = async (req: Request, res: Response<Profile | { error: string }>) => {
  try {
    const profileId = 1; // Assuming a single profile for this app

    const profileRes = await pool.query('SELECT * FROM profile WHERE id = $1', [profileId]);
    if (profileRes.rows.length === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Fetch projects with their skills
    const projectsRes = await pool.query('SELECT * FROM projects WHERE profile_id = $1', [profileId]);
    const projectIds = projectsRes.rows.map((p: any) => p.id);
    let projectSkillsMap: Record<number, { id: number; name: string }[]> = {};
    if (projectIds.length > 0) {
      const skillsRes = await pool.query(
        `SELECT ps.project_id, s.id, s.name
         FROM project_skills ps
         JOIN skills s ON ps.skill_id = s.id
         WHERE ps.project_id = ANY($1)`, [projectIds]
      );
      for (const row of skillsRes.rows) {
        if (!projectSkillsMap[row.project_id]) projectSkillsMap[row.project_id] = [];
        projectSkillsMap[row.project_id].push({ id: row.id, name: row.name });
      }
    }
    const projectsWithSkills = projectsRes.rows.map((p: any) => ({ ...p, skills: projectSkillsMap[p.id] || [] }));

    const educationRes = await pool.query('SELECT * FROM education WHERE profile_id = $1', [profileId]);
    const workRes = await pool.query('SELECT * FROM work_experience WHERE profile_id = $1', [profileId]);
    const allSkillsRes = await pool.query('SELECT id, name FROM skills');
    const profile: Profile = {
      ...profileRes.rows[0],
      projects: projectsWithSkills,
      education: educationRes.rows,
      work_experience: workRes.rows,
      skills: allSkillsRes.rows,
    };

    res.json(profile);
  } catch (err) {
    console.error('Error fetching profile:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
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

    // Replace all projects and their skills if provided
    if (Array.isArray(projects)) {
      // Delete old projects and their project_skills
      const oldProjects = await client.query('SELECT id FROM projects WHERE profile_id = $1', [id]);
      for (const row of oldProjects.rows) {
        await client.query('DELETE FROM project_skills WHERE project_id = $1', [row.id]);
      }
      await client.query('DELETE FROM projects WHERE profile_id = $1', [id]);
      for (const proj of projects) {
        const projectRes = await client.query(
          `INSERT INTO projects (profile_id, title, description, project_url, github_url)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING id`,
          [id, proj.title, proj.description, proj.project_url || null, proj.github_url || null]
        );
        const projectId = projectRes.rows[0].id;
        if (Array.isArray(proj.skills)) {
          for (const skill of proj.skills) {
            // Insert skill if not exists
            let skillId: number;
            const skillRes = await client.query('SELECT id FROM skills WHERE name = $1', [skill.name]);
            if (skillRes.rows.length > 0) {
              skillId = skillRes.rows[0].id;
            } else {
              const newSkillRes = await client.query('INSERT INTO skills (name) VALUES ($1) RETURNING id', [skill.name]);
              skillId = newSkillRes.rows[0].id;
            }
            // Link project to skill
            await client.query('INSERT INTO project_skills (project_id, skill_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [projectId, skillId]);
          }
        }
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
};
