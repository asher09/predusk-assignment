
import { Router } from 'express';
import profileRoutes from './profile.routes';
import projectRoutes from './project.routes';
import skillRoutes from './skill.routes';
import searchRoutes from './search.routes';

const router = Router();

router.use('/profile', profileRoutes);
router.use('/projects', projectRoutes);
router.use('/skills', skillRoutes);
router.use('/search', searchRoutes);

export default router;
