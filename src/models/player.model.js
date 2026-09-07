// Este archivo define el modelo Sequelize de jugadores.
import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Player = sequelize.define(
  "Player",
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
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: "user_id",
    },
    name: {
      type: DataTypes.STRING(120),
      allowNull: false,
    },
    position: {
      type: DataTypes.STRING(60),
      allowNull: true,
    },
    number: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    avatar: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    location: {
      type: DataTypes.STRING(120),
      allowNull: true,
    },
    birthDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: "birth_date",
    },
    team: {
      type: DataTypes.STRING(120),
      allowNull: true,
    },
    rosterStatus: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "active",
      field: "roster_status",
    },
    primaryCategoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "primary_category_id",
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
    tableName: "players",
    timestamps: false,
  },
);

export default Player;
