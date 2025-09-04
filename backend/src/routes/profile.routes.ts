import { Router } from "express";
import { getProfile, updateProfile, getProjects, search } from "../controllers/profile.controller";

const router = Router();

router.get("/profile", getProfile);
router.put("/profile", updateProfile);
router.get("/projects", getProjects);
router.get("/search", search);

export default router;
