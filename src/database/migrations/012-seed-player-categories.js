// Este archivo inserta las relaciones iniciales entre jugadores y categorias.
import { playerCategorySeeds } from "../seed-data.js";
export async function up({ context: queryInterface }) {
  await queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.bulkInsert("player_categories", playerCategorySeeds, {
      transaction,
    });
  });
}

export async function down({ context: queryInterface }) {
  await queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.sequelize.query("DELETE FROM player_categories;", {
      transaction,
    });
  });
}
