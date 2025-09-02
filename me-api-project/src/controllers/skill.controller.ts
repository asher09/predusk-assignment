
import { Request, Response } from 'express';
import pool from '../db/pool';

export const getTopSkills = async (req: Request, res: Response) => {
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
};
