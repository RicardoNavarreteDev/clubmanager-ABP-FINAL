// Este archivo inserta los roles base del sistema.
import { roleSeeds } from "../seed-data.js";
export async function up({ context: queryInterface }) {
  await queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.bulkInsert("roles", roleSeeds, { transaction });
    await queryInterface.sequelize.query(
      "SELECT setval('roles_id_seq', (SELECT MAX(id) FROM roles));",
      { transaction },
    );
  });
}

export async function down({ context: queryInterface }) {
  await queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.sequelize.query(
      "DELETE FROM roles WHERE id IN (1, 2, 3);",
      { transaction },
    );
  });
}
