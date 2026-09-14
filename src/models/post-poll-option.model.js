import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const PostPollOption = sequelize.define("PostPollOption", {
  id: { type: DataTypes.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true },
  pollId: { type: DataTypes.INTEGER, allowNull: false, field: "poll_id" },
  label: { type: DataTypes.STRING(120), allowNull: false },
  position: { type: DataTypes.SMALLINT, allowNull: false },
  createdAt: { type: DataTypes.DATE, allowNull: false, field: "created_at" },
}, { tableName: "post_poll_options", timestamps: false });

export default PostPollOption;
