// Este archivo inserta las relaciones iniciales entre usuarios y roles.
import { userRoleSeeds } from "../seed-data.js";
export async function up({ context: queryInterface }) {
  await queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.bulkInsert("user_roles", userRoleSeeds, { transaction });
  });
}

export async function down({ context: queryInterface }) {
  await queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.sequelize.query("DELETE FROM user_roles;", { transaction });
  });
}
