import { Router } from "express";
import { authenticateJwt } from "../../middlewares/auth.middleware.js";
import { uploadPostImage } from "../../middlewares/post-image-upload.middleware.js";
import {
  createComment,
  createPost,
  createReply,
  listFeed,
  toggleLike,
  vote,
} from "./feed.api.controller.js";

const router = Router();

router.get("/", authenticateJwt, listFeed);
router.post("/", authenticateJwt, uploadPostImage, createPost);
router.post("/:postId/likes", authenticateJwt, toggleLike);
router.post("/:postId/votes", authenticateJwt, vote);
router.post("/:postId/comments", authenticateJwt, createComment);
router.post("/:postId/comments/:commentId/replies", authenticateJwt, createReply);

export default router;
