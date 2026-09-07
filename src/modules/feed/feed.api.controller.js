import { unlink } from "node:fs/promises";
import { sendSuccess } from "../../shared/responses/api-response.js";
import {
  addComment,
  createPost as createPostRecord,
  listFeed as listFeedRecords,
  togglePostLike,
  voteInPoll,
} from "./feed.service.js";
import {
  validateCommentPayload,
  validateCreatePostPayload,
  validateFeedQuery,
  validateId,
  validateVotePayload,
} from "./feed.validation.js";

export const listFeed = async (req, res, next) => {
  try {
    const result = await listFeedRecords(req.user.userId, validateFeedQuery(req.query));
    return sendSuccess(res, "Feed obtenido correctamente", result);
  } catch (error) {
    return next(error);
  }
};

export const createPost = async (req, res, next) => {
  try {
    const imageUrl = req.file ? `/uploads/posts/${req.file.filename}` : null;
    const payload = validateCreatePostPayload(req.body, imageUrl);
    const post = await createPostRecord(req.user.userId, payload);
    return sendSuccess(res, "Publicacion creada correctamente", post, 201);
  } catch (error) {
    if (req.file?.path) await unlink(req.file.path).catch(() => null);
    return next(error);
  }
};

export const toggleLike = async (req, res, next) => {
  try {
    const result = await togglePostLike(req.user.userId, validateId(req.params.postId, "postId"));
    return sendSuccess(res, "Reaccion actualizada correctamente", result);
  } catch (error) {
    return next(error);
  }
};

export const createComment = async (req, res, next) => {
  try {
    const postId = validateId(req.params.postId, "postId");
    const { content } = validateCommentPayload(req.body);
    const comment = await addComment(req.user.userId, postId, content);
    return sendSuccess(res, "Comentario creado correctamente", comment, 201);
  } catch (error) {
    return next(error);
  }
};

export const createReply = async (req, res, next) => {
  try {
    const postId = validateId(req.params.postId, "postId");
    const commentId = validateId(req.params.commentId, "commentId");
    const { content } = validateCommentPayload(req.body);
    const comment = await addComment(req.user.userId, postId, content, commentId);
    return sendSuccess(res, "Respuesta creada correctamente", comment, 201);
  } catch (error) {
    return next(error);
  }
};

export const vote = async (req, res, next) => {
  try {
    const postId = validateId(req.params.postId, "postId");
    const { optionId } = validateVotePayload(req.body);
    const poll = await voteInPoll(req.user.userId, postId, optionId);
    return sendSuccess(res, "Voto registrado correctamente", poll);
  } catch (error) {
    return next(error);
  }
};
