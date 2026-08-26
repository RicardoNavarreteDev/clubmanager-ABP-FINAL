// Este archivo define el modelo Sequelize de partidos.
import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Match = sequelize.define(
  "Match",
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    championshipId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: "championship_id",
    },
    opponent: {
      type: DataTypes.STRING(120),
      allowNull: false,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    time: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    location: {
      type: DataTypes.STRING(160),
      allowNull: false,
    },
    condition: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    result: {
      type: DataTypes.STRING(40),
      allowNull: false,
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
    tableName: "matches",
    timestamps: false,
  },
);

export default Match;
