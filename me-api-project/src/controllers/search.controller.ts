
import { Request, Response } from 'express';
import pool from '../db/pool';

export const search = async (req: Request, res: Response) => {
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
};
