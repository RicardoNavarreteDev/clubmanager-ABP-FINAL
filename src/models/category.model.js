// Este archivo define el modelo Sequelize de categorias del club.
import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Category = sequelize.define(
  "Category",
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(60),
      allowNull: false,
    },
    genderScope: {
      type: DataTypes.STRING(30),
      allowNull: false,
      field: "gender_scope",
    },
    minAge: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "min_age",
    },
    maxAge: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: "max_age",
    },
  },
  {
    tableName: "categories",
    timestamps: false,
  },
);

export default Category;
