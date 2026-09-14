// Este archivo separa jugadores e invitaciones del contenido demo por club.
import { DataTypes } from "sequelize";

const TABLES = ["players", "invitations"];

export async function up({ context: queryInterface }) {
  await queryInterface.sequelize.transaction(async (transaction) => {
    for (const table of TABLES) {
      await queryInterface.addColumn(table, "club_id", {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: "clubs", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      }, { transaction });
      await queryInterface.addIndex(table, ["club_id"], {
        name: `${table}_club_id_idx`,
        transaction,
      });
    }
  });
}

export async function down({ context: queryInterface }) {
  await queryInterface.sequelize.transaction(async (transaction) => {
    for (const table of [...TABLES].reverse()) {
      await queryInterface.removeColumn(table, "club_id", { transaction });
    }
  });
}
