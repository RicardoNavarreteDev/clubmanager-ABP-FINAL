// Este archivo define las rutas API del modulo de jugadores.
import { Router } from "express";
import { authenticateJwt, authorizeRoles } from "../../middlewares/auth.middleware.js";
import {
  getPlayerById,
  listPlayers,
  patchPlayerStatus,
  updatePlayer,
} from "./players.api.controller.js";

const router = Router();

router.get("/", listPlayers);
router.get("/:id", getPlayerById);
router.put("/:id", authenticateJwt, authorizeRoles("admin", "coach"), updatePlayer);
router.patch("/:id/status", authenticateJwt, authorizeRoles("admin", "coach"), patchPlayerStatus);

export default router;
