import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const PostComment = sequelize.define("PostComment", {
  id: { type: DataTypes.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true },
  postId: { type: DataTypes.INTEGER, allowNull: false, field: "post_id" },
  authorId: { type: DataTypes.INTEGER, allowNull: false, field: "author_id" },
  parentId: { type: DataTypes.INTEGER, allowNull: true, field: "parent_id" },
  content: { type: DataTypes.TEXT, allowNull: false },
  createdAt: { type: DataTypes.DATE, allowNull: false, field: "created_at" },
  updatedAt: { type: DataTypes.DATE, allowNull: false, field: "updated_at" },
}, { tableName: "post_comments", timestamps: false });

export default PostComment;
