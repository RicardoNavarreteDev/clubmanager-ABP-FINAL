import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const PostPollVote = sequelize.define("PostPollVote", {
  id: { type: DataTypes.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true },
  pollId: { type: DataTypes.INTEGER, allowNull: false, field: "poll_id" },
  optionId: { type: DataTypes.INTEGER, allowNull: false, field: "option_id" },
  userId: { type: DataTypes.INTEGER, allowNull: false, field: "user_id" },
  createdAt: { type: DataTypes.DATE, allowNull: false, field: "created_at" },
  updatedAt: { type: DataTypes.DATE, allowNull: false, field: "updated_at" },
}, { tableName: "post_poll_votes", timestamps: false });

export default PostPollVote;
