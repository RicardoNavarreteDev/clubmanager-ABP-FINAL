// Este archivo crea la tabla de entrenamientos.
import { DataTypes } from "sequelize";
export async function up({ context: queryInterface }) {
  await queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.createTable(
      "trainings",
      {
        id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
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
        training_type: {
          type: DataTypes.STRING(40),
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
        ALTER TABLE trainings
        ADD CONSTRAINT trainings_valid_values
        CHECK (
          char_length(btrim(training_type)) > 0
          AND char_length(btrim(time)) > 0
          AND char_length(btrim(location)) > 0
        );
      `,
      { transaction },
    );

    await queryInterface.addIndex("trainings", ["category_id"], {
      name: "trainings_category_id_idx",
      transaction,
    });
  });
}

export async function down({ context: queryInterface }) {
  await queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.dropTable("trainings", { transaction });
  });
}
