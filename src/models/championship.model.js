// Este archivo define el modelo Sequelize de campeonatos.
import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Championship = sequelize.define(
  "Championship",
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
    name: {
      type: DataTypes.STRING(120),
      allowNull: false,
    },
    season: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "category_id",
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    primaryVenue: {
      type: DataTypes.STRING(160),
      allowNull: false,
      field: "primary_venue",
    },
    isVariableVenue: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: "is_variable_venue",
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: "start_date",
    },
    endDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: "end_date",
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
    tableName: "championships",
    timestamps: false,
  },
);

export default Championship;
