// Este archivo define la ruta web de gestion de invitaciones.
import { Router } from "express";
import { requireManagementAccess } from "../../middlewares/web-auth.middleware.js";
import { renderInvitationsManagement } from "./invitations.web.controller.js";

const router = Router();

router.get("/", requireManagementAccess, renderInvitationsManagement);

export default router;
