
import { Request, Response } from 'express';
import pool from '../db/pool';
import { Project } from '../types';

export const getProjects = async (req: Request, res: Response<Project[] | { error: string }>) => {
  const { skill, page = '1', limit = '10' } = req.query;
  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);
  const offset = (pageNum - 1) * limitNum;

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

    query += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(limitNum, offset);

    const projectsResult = await pool.query(query, params);
    res.json(projectsResult.rows);
  } catch (err) {
    console.error('Error fetching projects:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
