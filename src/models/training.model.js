// Este archivo define el modelo Sequelize de entrenamientos.
import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Training = sequelize.define(
  "Training",
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "category_id",
    },
    trainingType: {
      type: DataTypes.STRING(40),
      allowNull: false,
      field: "training_type",
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
    tableName: "trainings",
    timestamps: false,
  },
);

export default Training;
