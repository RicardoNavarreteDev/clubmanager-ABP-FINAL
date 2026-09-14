// Este archivo agrega el alcance de club sin reasignar las filas demo existentes.
import { DataTypes } from "sequelize";

const TABLES = ["categories", "championships", "matches"];

export async function up({ context: queryInterface }) {
  await queryInterface.sequelize.transaction(async (transaction) => {
    for (const table of TABLES) {
      await queryInterface.addColumn(
        table,
        "club_id",
        {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: {
            model: "clubs",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "SET NULL",
        },
        { transaction },
      );

      await queryInterface.addIndex(table, ["club_id"], {
        name: `${table}_club_id_idx`,
        transaction,
      });
    }

    await queryInterface.sequelize.query(
      "DROP INDEX IF EXISTS categories_name_lower_unique;",
      { transaction },
    );
    await queryInterface.sequelize.query(
      "CREATE UNIQUE INDEX categories_club_name_lower_unique ON categories (COALESCE(club_id, 0), LOWER(name));",
      { transaction },
    );
  });
}

export async function down({ context: queryInterface }) {
  await queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.sequelize.query(
      "DROP INDEX IF EXISTS categories_club_name_lower_unique;",
      { transaction },
    );
    for (const table of [...TABLES].reverse()) {
      await queryInterface.removeColumn(table, "club_id", { transaction });
    }
    await queryInterface.sequelize.query(
      "CREATE UNIQUE INDEX categories_name_lower_unique ON categories (LOWER(name));",
      { transaction },
    );
  });
}
