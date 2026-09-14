import { Router } from "express";
import { requireWebAuth } from "../../middlewares/web-auth.middleware.js";
import { uploadClubLogo } from "../../middlewares/club-logo-upload.middleware.js";
import { activateClub, handleCreateClub, renderCreateClub, renderLanding } from "./clubs.web.controller.js";

const router = Router();

router.get("/", renderLanding);
router.get("/crear-club", renderCreateClub);
router.post("/crear-club", uploadClubLogo, handleCreateClub);
router.post("/clubs/:clubId/activar", requireWebAuth, activateClub);

export default router;
