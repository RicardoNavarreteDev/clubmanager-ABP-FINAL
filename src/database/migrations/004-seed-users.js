// Este archivo inserta los usuarios iniciales del sistema.
import { userSeeds } from "../seed-data.js";
export async function up({ context: queryInterface }) {
  await queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.bulkInsert("users", userSeeds, { transaction });
    await queryInterface.sequelize.query(
      "SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));",
      { transaction },
    );
  });
}

export async function down({ context: queryInterface }) {
  await queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.sequelize.query(
      "DELETE FROM users WHERE id IN (1, 2, 3);",
      { transaction },
    );
  });
}
