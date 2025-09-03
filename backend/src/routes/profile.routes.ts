import { Router } from "express";
import { getProfile, updateProfile, getProjectsBySkill, search, healthCheck } from "../controllers/profile.controller";

const router = Router();

router.get("/profile", getProfile);
router.put("/profile", updateProfile);
router.get("/projects", getProjectsBySkill);
router.get("/search", search);
router.get("/health", healthCheck);

export default router;
