// Este archivo define las rutas API del modulo de invitaciones.
import { Router } from "express";
import {
  createInvitation,
  getInvitationById,
  getInvitationByToken,
  listInvitations,
  patchInvitationStatus,
} from "./invitations.api.controller.js";

const router = Router();

router.get("/", listInvitations);
router.get("/token/:token", getInvitationByToken);
router.get("/:id", getInvitationById);
router.post("/", createInvitation);
router.patch("/:id/status", patchInvitationStatus);

export default router;
