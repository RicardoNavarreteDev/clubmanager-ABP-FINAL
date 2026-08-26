// Este archivo crea la tabla de campeonatos.
import { DataTypes } from "sequelize";
export async function up({ context: queryInterface }) {
  await queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.createTable(
      "championships",
      {
        id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
        },
        name: {
          type: DataTypes.STRING(120),
          allowNull: false,
        },
        season: {
          type: DataTypes.STRING(20),
          allowNull: false,
        },
        category_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: "categories",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "RESTRICT",
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        primary_venue: {
          type: DataTypes.STRING(160),
          allowNull: false,
        },
        is_variable_venue: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        status: {
          type: DataTypes.STRING(20),
          allowNull: false,
        },
        start_date: {
          type: DataTypes.DATEONLY,
          allowNull: false,
        },
        end_date: {
          type: DataTypes.DATEONLY,
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
        ALTER TABLE championships
        ADD CONSTRAINT championships_valid_values
        CHECK (
          char_length(btrim(name)) > 0
          AND char_length(btrim(season)) > 0
          AND char_length(btrim(description)) > 0
          AND char_length(btrim(primary_venue)) > 0
          AND status IN ('active', 'upcoming')
          AND end_date >= start_date
        );
      `,
      { transaction },
    );

    await queryInterface.addIndex("championships", ["category_id"], {
      name: "championships_category_id_idx",
      transaction,
    });
  });
}

export async function down({ context: queryInterface }) {
  await queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.dropTable("championships", { transaction });
  });
}
