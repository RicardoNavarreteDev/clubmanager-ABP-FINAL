import { unlink } from "node:fs/promises";
import { sendError, sendSuccess } from "../../shared/responses/api-response.js";

const resolveErrorStatus = (error) => {
  if (Number.isInteger(error?.statusCode)) {
    return error.statusCode;
  }

  const message = error?.message ?? "";

  if (message.includes("no encontrado") || message.includes("no encontrada")) {
    return 404;
  }

  if (message.includes("obligatorio") || message.includes("debe") || message.includes("Debes")) {
    return 400;
  }

  if (message.includes("ya existe") || message.includes("desactivada")) {
    return 409;
  }

  return 500;
};
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
    const result = await listFeedRecords(req.user.userId, req.user.clubId, validateFeedQuery(req.query));
    return sendSuccess(res, "Feed obtenido correctamente", result);
  } catch (error) {
    return sendError(res, error.message || "No se pudo obtener el feed", resolveErrorStatus(error));
  }
};

export const createPost = async (req, res, next) => {
  try {
    const imageUrl = req.file ? `/uploads/posts/${req.file.filename}` : null;
    const payload = validateCreatePostPayload(req.body, imageUrl);
    const post = await createPostRecord(req.user.userId, req.user.clubId, payload);
    return sendSuccess(res, "Publicacion creada correctamente", post, 201);
  } catch (error) {
    if (req.file?.path) await unlink(req.file.path).catch(() => null);
    return sendError(res, error.message || "No se pudo crear la publicacion", resolveErrorStatus(error));
  }
};

export const toggleLike = async (req, res, next) => {
  try {
    const result = await togglePostLike(req.user.userId, req.user.clubId, validateId(req.params.postId, "postId"));
    return sendSuccess(res, "Reaccion actualizada correctamente", result);
  } catch (error) {
    return sendError(res, error.message || "No se pudo actualizar la reaccion", resolveErrorStatus(error));
  }
};

export const createComment = async (req, res, next) => {
  try {
    const postId = validateId(req.params.postId, "postId");
    const { content } = validateCommentPayload(req.body);
    const comment = await addComment(req.user.userId, req.user.clubId, postId, content);
    return sendSuccess(res, "Comentario creado correctamente", comment, 201);
  } catch (error) {
    return sendError(res, error.message || "No se pudo crear el comentario", resolveErrorStatus(error));
  }
};

export const createReply = async (req, res, next) => {
  try {
    const postId = validateId(req.params.postId, "postId");
    const commentId = validateId(req.params.commentId, "commentId");
    const { content } = validateCommentPayload(req.body);
    const comment = await addComment(req.user.userId, req.user.clubId, postId, content, commentId);
    return sendSuccess(res, "Respuesta creada correctamente", comment, 201);
  } catch (error) {
    return sendError(res, error.message || "No se pudo crear la respuesta", resolveErrorStatus(error));
  }
};

export const vote = async (req, res, next) => {
  try {
    const postId = validateId(req.params.postId, "postId");
    const { optionId } = validateVotePayload(req.body);
    const poll = await voteInPoll(req.user.userId, req.user.clubId, postId, optionId);
    return sendSuccess(res, "Voto registrado correctamente", poll);
  } catch (error) {
    return sendError(res, error.message || "No se pudo registrar el voto", resolveErrorStatus(error));
  }
};
