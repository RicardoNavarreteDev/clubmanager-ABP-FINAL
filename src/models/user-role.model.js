// Este archivo define el modelo Sequelize de la relacion entre usuarios y roles.
import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const UserRole = sequelize.define(
  "UserRole",
  {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      field: "user_id",
    },
    roleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      field: "role_id",
    },
  },
  {
    tableName: "user_roles",
    timestamps: false,
  },
);

export default UserRole;
