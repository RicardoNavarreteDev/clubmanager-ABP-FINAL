import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const PostLike = sequelize.define("PostLike", {
  postId: { type: DataTypes.INTEGER, allowNull: false, primaryKey: true, field: "post_id" },
  userId: { type: DataTypes.INTEGER, allowNull: false, primaryKey: true, field: "user_id" },
  createdAt: { type: DataTypes.DATE, allowNull: false, field: "created_at" },
}, { tableName: "post_likes", timestamps: false });

export default PostLike;
