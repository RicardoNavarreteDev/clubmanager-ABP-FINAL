// Este archivo crea la tabla de partidos.
import { DataTypes } from "sequelize";
export async function up({ context: queryInterface }) {
  await queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.createTable(
      "matches",
      {
        id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
        },
        championship_id: {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: {
            model: "championships",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "SET NULL",
        },
        opponent: {
          type: DataTypes.STRING(120),
          allowNull: false,
        },
        date: {
          type: DataTypes.DATEONLY,
          allowNull: false,
        },
        time: {
          type: DataTypes.STRING(20),
          allowNull: false,
        },
        location: {
          type: DataTypes.STRING(160),
          allowNull: false,
        },
        condition: {
          type: DataTypes.STRING(20),
          allowNull: false,
        },
        status: {
          type: DataTypes.STRING(20),
          allowNull: false,
        },
        result: {
          type: DataTypes.STRING(40),
          allowNull: false,
        },
        created_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
        updated_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
      },
      { transaction },
    );

    await queryInterface.sequelize.query(
      `
        ALTER TABLE matches
        ADD CONSTRAINT matches_valid_values
        CHECK (
          char_length(btrim(opponent)) > 0
          AND char_length(btrim(time)) > 0
          AND char_length(btrim(location)) > 0
          AND condition IN ('local', 'visita')
          AND status IN ('upcoming', 'finished')
        );
      `,
      { transaction },
    );

    await queryInterface.addIndex("matches", ["championship_id"], {
      name: "matches_championship_id_idx",
      transaction,
    });
  });
}

export async function down({ context: queryInterface }) {
  await queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.dropTable("matches", { transaction });
  });
}
