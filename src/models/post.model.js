import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Post = sequelize.define("Post", {
  id: { type: DataTypes.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true },
  clubId: { type: DataTypes.INTEGER, allowNull: false, field: "club_id" },
  authorId: { type: DataTypes.INTEGER, allowNull: false, field: "author_id" },
  type: { type: DataTypes.STRING(20), allowNull: false },
  content: { type: DataTypes.TEXT, allowNull: true },
  imageUrl: { type: DataTypes.STRING(255), allowNull: true, field: "image_url" },
  eventTitle: { type: DataTypes.STRING(160), allowNull: true, field: "event_title" },
  eventStartAt: { type: DataTypes.DATE, allowNull: true, field: "event_start_at" },
  eventLocation: { type: DataTypes.STRING(200), allowNull: true, field: "event_location" },
  createdAt: { type: DataTypes.DATE, allowNull: false, field: "created_at" },
  updatedAt: { type: DataTypes.DATE, allowNull: false, field: "updated_at" },
}, { tableName: "posts", timestamps: false });

export default Post;
