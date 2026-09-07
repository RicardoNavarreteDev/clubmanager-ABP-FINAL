// Este archivo define el modelo Sequelize de invitaciones para nuevos usuarios o jugadores.
import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Invitation = sequelize.define(
  "Invitation",
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    clubId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: "club_id",
    },
    email: {
      type: DataTypes.STRING(160),
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(120),
      allowNull: false,
    },
    roleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "role_id",
    },
    playerId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: "player_id",
    },
    primaryCategoryId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: "primary_category_id",
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    token: {
      type: DataTypes.STRING(120),
      allowNull: false,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: "expires_at",
    },
    acceptedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "accepted_at",
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: "created_at",
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: "updated_at",
    },
  },
  {
    tableName: "invitations",
    timestamps: false,
  },
);

export default Invitation;
