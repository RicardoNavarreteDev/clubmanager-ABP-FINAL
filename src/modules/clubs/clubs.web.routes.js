import { Router } from "express";
import { redirectAuthenticatedUser } from "../../middlewares/web-auth.middleware.js";
import { uploadClubLogo } from "../../middlewares/club-logo-upload.middleware.js";
import { handleCreateClub, renderCreateClub, renderLanding } from "./clubs.web.controller.js";

const router = Router();

router.get("/", renderLanding);
router.get("/crear-club", redirectAuthenticatedUser, renderCreateClub);
router.post("/crear-club", redirectAuthenticatedUser, uploadClubLogo, handleCreateClub);

export default router;
