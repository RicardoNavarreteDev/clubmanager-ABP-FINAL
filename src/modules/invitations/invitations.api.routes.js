// Este archivo define las rutas API del modulo de invitaciones.
import { Router } from "express";
import { authenticateJwt, authorizeRoles } from "../../middlewares/auth.middleware.js";
import {
  createInvitation,
  getInvitationById,
  getInvitationByToken,
  listInvitations,
  patchInvitationStatus,
} from "./invitations.api.controller.js";

const router = Router();

router.get("/", authenticateJwt, authorizeRoles("admin", "coach"), listInvitations);
router.get("/token/:token", getInvitationByToken);
router.get("/:id", authenticateJwt, authorizeRoles("admin", "coach"), getInvitationById);
router.post("/", authenticateJwt, authorizeRoles("admin", "coach"), createInvitation);
router.patch("/:id/status", authenticateJwt, authorizeRoles("admin", "coach"), patchInvitationStatus);

export default router;
