// Habilita cuentas multi-club y elimina el entorno previo para iniciar desde cero.
import { DataTypes } from "sequelize";

export async function up({ context: queryInterface }) {
  await queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.createTable("club_memberships", {
      id: { type: DataTypes.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true },
      user_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: "users", key: "id" }, onUpdate: "CASCADE", onDelete: "CASCADE" },
      club_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: "clubs", key: "id" }, onUpdate: "CASCADE", onDelete: "CASCADE" },
      role_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: "roles", key: "id" }, onUpdate: "CASCADE", onDelete: "RESTRICT" },
      is_owner: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    }, { transaction });
    await queryInterface.addConstraint("club_memberships", { fields: ["user_id", "club_id"], type: "unique", name: "club_memberships_user_club_unique", transaction });
    await queryInterface.addIndex("club_memberships", ["club_id"], { name: "club_memberships_club_id_idx", transaction });
    // Petición explícita: comenzar sin cuentas, clubes ni datos asociados de pruebas.
    await queryInterface.sequelize.query("TRUNCATE TABLE users, clubs RESTART IDENTITY CASCADE;", { transaction });
  });
}

export async function down({ context: queryInterface }) {
  await queryInterface.dropTable("club_memberships");
}
