// Este archivo define la identidad del club administrado por la instalacion.
import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Club = sequelize.define(
  "Club",
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(120),
      allowNull: false,
    },
    sport: {
      type: DataTypes.STRING(80),
      allowNull: false,
    },
    location: {
      type: DataTypes.STRING(160),
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    logo: {
      type: DataTypes.STRING(255),
      allowNull: true,
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
    tableName: "clubs",
    timestamps: false,
  },
);

export default Club;
