import { Router } from "express";
import { renderChampionships } from "../controllers/championships.controller.js";

const router = Router();

router.get("/", renderChampionships);

export default router;
