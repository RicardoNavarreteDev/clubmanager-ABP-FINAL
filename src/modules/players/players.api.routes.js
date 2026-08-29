// Este archivo define las rutas API del modulo de jugadores.
import { Router } from "express";
import {
  getPlayerById,
  listPlayers,
  patchPlayerStatus,
  updatePlayer,
} from "./players.api.controller.js";

const router = Router();

router.get("/", listPlayers);
router.get("/:id", getPlayerById);
router.put("/:id", updatePlayer);
router.patch("/:id/status", patchPlayerStatus);

export default router;
