// Vincula una cuenta con cada club al que puede acceder y su rol dentro de ese club.
import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const ClubMembership = sequelize.define("ClubMembership", {
  id: { type: DataTypes.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true },
  userId: { type: DataTypes.INTEGER, allowNull: false, field: "user_id" },
  clubId: { type: DataTypes.INTEGER, allowNull: false, field: "club_id" },
  roleId: { type: DataTypes.INTEGER, allowNull: false, field: "role_id" },
  isOwner: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false, field: "is_owner" },
  createdAt: { type: DataTypes.DATE, allowNull: false, field: "created_at" },
  updatedAt: { type: DataTypes.DATE, allowNull: false, field: "updated_at" },
}, { tableName: "club_memberships", timestamps: false });

export default ClubMembership;
