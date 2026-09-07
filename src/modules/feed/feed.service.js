import sequelize from "../../config/db.js";
import User from "../../models/user.model.js";
import Post from "../../models/post.model.js";
import PostComment from "../../models/post-comment.model.js";
import PostLike from "../../models/post-like.model.js";
import PostPoll from "../../models/post-poll.model.js";
import PostPollOption from "../../models/post-poll-option.model.js";
import PostPollVote from "../../models/post-poll-vote.model.js";
import { initFeedAssociations } from "./feed.associations.js";

const httpError = (message, statusCode) => Object.assign(new Error(message), { statusCode });
const rolePriority = ["admin", "coach", "player"];

const authorInclude = () => ({
  model: User,
  as: "author",
  attributes: ["id", "displayName", "avatar"],
  include: [{ association: "roles", attributes: ["name"], through: { attributes: [] } }],
});

const getRoleNames = (author) => (author?.roles ?? []).map((role) => role.name);

const mapAuthor = (author) => {
  if (!author) return null;
  const roles = getRoleNames(author);
  return {
    id: author.id,
    displayName: author.displayName,
    avatar: author.avatar,
    roles,
    role: rolePriority.find((role) => roles.includes(role)) ?? roles[0] ?? null,
  };
};

const mapComment = (comment) => ({
  id: comment.id,
  postId: comment.postId,
  parentId: comment.parentId,
  content: comment.content,
  author: mapAuthor(comment.author),
  createdAt: comment.createdAt,
  updatedAt: comment.updatedAt,
  replies: [],
});

const mapPoll = (poll, userId) => {
  if (!poll) return null;
  const options = [...(poll.options ?? [])]
    .sort((left, right) => left.position - right.position)
    .map((option) => ({
    id: option.id,
    label: option.label,
    position: option.position,
    votesCount: (option.votes ?? []).length,
    selectedByCurrentUser: (option.votes ?? []).some((vote) => vote.userId === userId),
    }));
  return {
    id: poll.id,
    question: poll.question,
    votesCount: options.reduce((total, option) => total + option.votesCount, 0),
    options,
  };
};

const mapPost = (instance, userId) => {
  const post = instance.toJSON();
  const comments = (post.comments ?? []).map(mapComment);
  const commentsById = new Map(comments.map((comment) => [comment.id, comment]));
  const topLevelComments = [];

  for (const comment of comments) {
    if (comment.parentId && commentsById.has(comment.parentId)) {
      commentsById.get(comment.parentId).replies.push(comment);
    } else {
      topLevelComments.push(comment);
    }
  }

  const byCreationDate = (left, right) => (
    new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime() || left.id - right.id
  );
  topLevelComments.sort(byCreationDate);
  topLevelComments.forEach((comment) => comment.replies.sort(byCreationDate));

  return {
    id: post.id,
    type: post.type,
    content: post.content,
    imageUrl: post.imageUrl,
    event: post.type === "event" ? {
      title: post.eventTitle,
      startAt: post.eventStartAt,
      location: post.eventLocation,
    } : null,
    author: mapAuthor(post.author),
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    likesCount: (post.likes ?? []).length,
    likedByCurrentUser: (post.likes ?? []).some((like) => like.userId === userId),
    commentsCount: comments.length,
    comments: topLevelComments,
    poll: mapPoll(post.poll, userId),
  };
};

const getActor = async (userId, transaction) => {
  initFeedAssociations();
  const user = await User.findByPk(userId, {
    attributes: ["id", "clubId", "isActive"],
    include: [{ association: "roles", attributes: ["name"], through: { attributes: [] } }],
    transaction,
  });
  if (!user || !user.isActive) throw httpError("El usuario autenticado no existe o esta inactivo.", 401);
  if (!user.clubId) throw httpError("El usuario autenticado no pertenece a un club.", 403);
  return user;
};

const feedIncludes = () => [
  authorInclude(),
  { model: PostLike, as: "likes", attributes: ["userId"] },
  {
    model: PostComment,
    as: "comments",
    attributes: ["id", "postId", "authorId", "parentId", "content", "createdAt", "updatedAt"],
    include: [authorInclude()],
  },
  {
    model: PostPoll,
    as: "poll",
    attributes: ["id", "question"],
    include: [{
      model: PostPollOption,
      as: "options",
      attributes: ["id", "label", "position"],
      include: [{ model: PostPollVote, as: "votes", attributes: ["userId"] }],
    }],
  },
];

const getScopedPost = async (postId, actor, options = {}) => {
  const post = await Post.findOne({
    where: { id: postId, clubId: actor.clubId },
    transaction: options.transaction,
    lock: options.lock,
  });
  if (!post) throw httpError("Publicacion no encontrada.", 404);
  return post;
};

const getFullPost = async (postId, actor) => {
  const post = await Post.findOne({
    where: { id: postId, clubId: actor.clubId },
    include: feedIncludes(),
  });
  if (!post) throw httpError("Publicacion no encontrada.", 404);
  return mapPost(post, actor.id);
};

export const listFeed = async (userId, { page, limit }) => {
  const actor = await getActor(userId);
  const where = { clubId: actor.clubId };
  const [total, posts] = await Promise.all([
    Post.count({ where }),
    Post.findAll({
      where,
      include: feedIncludes(),
      order: [["createdAt", "DESC"], ["id", "DESC"]],
      limit,
      offset: (page - 1) * limit,
    }),
  ]);
  return {
    posts: posts.map((post) => mapPost(post, actor.id)),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

export const createPost = async (userId, payload) => {
  const actor = await getActor(userId);
  const roleNames = getRoleNames(actor);
  if (payload.type === "announcement" && !roleNames.some((role) => role === "admin" || role === "coach")) {
    throw httpError("Solo admin o coach pueden crear anuncios.", 403);
  }

  const postId = await sequelize.transaction(async (transaction) => {
    const now = new Date();
    const post = await Post.create({
      clubId: actor.clubId,
      authorId: actor.id,
      type: payload.type,
      content: payload.content,
      imageUrl: payload.imageUrl,
      eventTitle: payload.type === "event" ? payload.eventTitle : null,
      eventStartAt: payload.type === "event" ? payload.eventStartAt : null,
      eventLocation: payload.type === "event" ? payload.eventLocation : null,
      createdAt: now,
      updatedAt: now,
    }, { transaction });

    if (payload.type === "poll") {
      const poll = await PostPoll.create({
        postId: post.id,
        question: payload.pollQuestion,
        createdAt: now,
        updatedAt: now,
      }, { transaction });
      await PostPollOption.bulkCreate(payload.pollOptions.map((label, position) => ({
        pollId: poll.id,
        label,
        position,
        createdAt: now,
      })), { transaction });
    }
    return post.id;
  });

  return getFullPost(postId, actor);
};

export const togglePostLike = async (userId, postId) => {
  const actor = await getActor(userId);
  const liked = await sequelize.transaction(async (transaction) => {
    await getScopedPost(postId, actor, { transaction, lock: transaction.LOCK.UPDATE });
    const existing = await PostLike.findOne({ where: { postId, userId: actor.id }, transaction });
    if (existing) {
      await existing.destroy({ transaction });
      return false;
    }
    await PostLike.create({ postId, userId: actor.id, createdAt: new Date() }, { transaction });
    return true;
  });
  return { liked, likesCount: await PostLike.count({ where: { postId } }) };
};

const loadComment = async (commentId) => {
  const comment = await PostComment.findByPk(commentId, { include: [authorInclude()] });
  return mapComment(comment.toJSON());
};

export const addComment = async (userId, postId, content, parentId = null) => {
  const actor = await getActor(userId);
  const commentId = await sequelize.transaction(async (transaction) => {
    await getScopedPost(postId, actor, { transaction });
    if (parentId) {
      const parent = await PostComment.findOne({ where: { id: parentId, postId }, transaction });
      if (!parent) throw httpError("Comentario padre no encontrado.", 404);
      if (parent.parentId) throw httpError("Solo se permite un nivel de respuestas.", 400);
    }
    const now = new Date();
    const comment = await PostComment.create({
      postId,
      authorId: actor.id,
      parentId,
      content,
      createdAt: now,
      updatedAt: now,
    }, { transaction });
    return comment.id;
  });
  return loadComment(commentId);
};

export const voteInPoll = async (userId, postId, optionId) => {
  const actor = await getActor(userId);
  await sequelize.transaction(async (transaction) => {
    await getScopedPost(postId, actor, { transaction, lock: transaction.LOCK.UPDATE });
    const poll = await PostPoll.findOne({ where: { postId }, transaction, lock: transaction.LOCK.UPDATE });
    if (!poll) throw httpError("La publicacion no contiene una encuesta.", 400);
    const option = await PostPollOption.findOne({ where: { id: optionId, pollId: poll.id }, transaction });
    if (!option) throw httpError("La opcion no pertenece a esta encuesta.", 400);
    const vote = await PostPollVote.findOne({ where: { pollId: poll.id, userId: actor.id }, transaction });
    const now = new Date();
    if (vote) {
      await vote.update({ optionId, updatedAt: now }, { transaction });
    } else {
      await PostPollVote.create({
        pollId: poll.id,
        optionId,
        userId: actor.id,
        createdAt: now,
        updatedAt: now,
      }, { transaction });
    }
  });
  const post = await getFullPost(postId, actor);
  return post.poll;
};
