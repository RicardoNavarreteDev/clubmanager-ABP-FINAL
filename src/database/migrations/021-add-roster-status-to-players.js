// Este archivo agrega el campo de estado de plantel a la tabla de jugadores.
import { DataTypes } from "sequelize";
export async function up({ context: queryInterface }) {
  await queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.addColumn(
      "players",
      "roster_status",
      {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: "active",
      },
      { transaction },
    );

    await queryInterface.sequelize.query(
      `
        ALTER TABLE players
        ADD CONSTRAINT players_roster_status_valid
        CHECK (roster_status IN ('invited', 'active', 'inactive'));
      `,
      { transaction },
    );

    await queryInterface.addIndex("players", ["roster_status"], {
      name: "players_roster_status_idx",
      transaction,
    });
  });
}

export async function down({ context: queryInterface }) {
  await queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.removeIndex("players", "players_roster_status_idx", {
      transaction,
    });
    await queryInterface.removeColumn("players", "roster_status", {
      transaction,
    });
  });
}
