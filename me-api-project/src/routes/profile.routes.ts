
import { Router } from 'express';
import { getProfile, updateProfile } from '../controllers/profile.controller';

const router = Router();

router.get('/', getProfile);
router.put('/:id', updateProfile);

export default router;
