import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const PostPoll = sequelize.define("PostPoll", {
  id: { type: DataTypes.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true },
  postId: { type: DataTypes.INTEGER, allowNull: false, unique: true, field: "post_id" },
  question: { type: DataTypes.STRING(300), allowNull: false },
  createdAt: { type: DataTypes.DATE, allowNull: false, field: "created_at" },
  updatedAt: { type: DataTypes.DATE, allowNull: false, field: "updated_at" },
}, { tableName: "post_polls", timestamps: false });

export default PostPoll;
