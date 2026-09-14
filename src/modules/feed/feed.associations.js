import Club from "../../models/club.model.js";
import User from "../../models/user.model.js";
import { initModelAssociations } from "../../models/associations.js";
import Post from "../../models/post.model.js";
import PostComment from "../../models/post-comment.model.js";
import PostLike from "../../models/post-like.model.js";
import PostPoll from "../../models/post-poll.model.js";
import PostPollOption from "../../models/post-poll-option.model.js";
import PostPollVote from "../../models/post-poll-vote.model.js";

let initialized = false;

export function initFeedAssociations() {
  if (initialized) return;

  initModelAssociations();

  Club.hasMany(Post, { foreignKey: "clubId", as: "feedPosts" });
  Post.belongsTo(Club, { foreignKey: "clubId", as: "club" });
  User.hasMany(Post, { foreignKey: "authorId", as: "authoredFeedPosts" });
  Post.belongsTo(User, { foreignKey: "authorId", as: "author" });

  Post.hasMany(PostLike, { foreignKey: "postId", as: "likes" });
  PostLike.belongsTo(Post, { foreignKey: "postId", as: "post" });
  User.hasMany(PostLike, { foreignKey: "userId", as: "feedPostLikes" });

  Post.hasMany(PostComment, { foreignKey: "postId", as: "comments" });
  PostComment.belongsTo(Post, { foreignKey: "postId", as: "post" });
  User.hasMany(PostComment, { foreignKey: "authorId", as: "authoredFeedComments" });
  PostComment.belongsTo(User, { foreignKey: "authorId", as: "author" });
  PostComment.hasMany(PostComment, { foreignKey: "parentId", as: "replies" });
  PostComment.belongsTo(PostComment, { foreignKey: "parentId", as: "parent" });

  Post.hasOne(PostPoll, { foreignKey: "postId", as: "poll" });
  PostPoll.belongsTo(Post, { foreignKey: "postId", as: "post" });
  PostPoll.hasMany(PostPollOption, { foreignKey: "pollId", as: "options" });
  PostPollOption.belongsTo(PostPoll, { foreignKey: "pollId", as: "poll" });
  PostPollOption.hasMany(PostPollVote, { foreignKey: "optionId", as: "votes" });
  PostPollVote.belongsTo(PostPollOption, { foreignKey: "optionId", as: "option" });
  PostPoll.hasMany(PostPollVote, { foreignKey: "pollId", as: "votes" });
  PostPollVote.belongsTo(PostPoll, { foreignKey: "pollId", as: "poll" });
  User.hasMany(PostPollVote, { foreignKey: "userId", as: "feedPollVotes" });

  initialized = true;
}
