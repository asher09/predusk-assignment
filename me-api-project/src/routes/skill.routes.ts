
import { Router } from 'express';
import { getTopSkills } from '../controllers/skill.controller';

const router = Router();

router.get('/top', getTopSkills);

export default router;
