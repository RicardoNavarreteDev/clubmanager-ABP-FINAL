import { Router } from "express";
import { renderEvents } from "../controllers/events.controller.js";

const router = Router();

router.get("/", renderEvents);

export default router;