// Este archivo crea la persistencia del feed social, sus comentarios, reacciones y encuestas.
import { DataTypes } from "sequelize";

const timestamps = {
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
};

export async function up({ context: queryInterface }) {
  await queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.createTable(
      "posts",
      {
        id: { type: DataTypes.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true },
        club_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: { model: "clubs", key: "id" },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
        author_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: { model: "users", key: "id" },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
        type: { type: DataTypes.STRING(20), allowNull: false },
        content: { type: DataTypes.TEXT, allowNull: true },
        image_url: { type: DataTypes.STRING(255), allowNull: true },
        event_title: { type: DataTypes.STRING(160), allowNull: true },
        event_start_at: { type: DataTypes.DATE, allowNull: true },
        event_location: { type: DataTypes.STRING(200), allowNull: true },
        ...timestamps,
      },
      { transaction },
    );

    await queryInterface.sequelize.query(
      `ALTER TABLE posts ADD CONSTRAINT posts_valid_payload CHECK (
        type IN ('text', 'photo', 'poll', 'event', 'announcement')
        AND (content IS NULL OR char_length(content) <= 5000)
        AND (type <> 'text' OR (content IS NOT NULL AND char_length(btrim(content)) > 0))
        AND (type <> 'announcement' OR (content IS NOT NULL AND char_length(btrim(content)) > 0))
        AND (type <> 'photo' OR image_url IS NOT NULL)
        AND (type <> 'event' OR (event_title IS NOT NULL AND char_length(btrim(event_title)) > 0 AND event_start_at IS NOT NULL))
      );`,
      { transaction },
    );
    await queryInterface.addIndex("posts", ["club_id", "created_at"], {
      name: "posts_club_created_at_idx",
      transaction,
    });

    await queryInterface.createTable(
      "post_likes",
      {
        post_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true,
          references: { model: "posts", key: "id" },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
        user_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true,
          references: { model: "users", key: "id" },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
        created_at: timestamps.created_at,
      },
      { transaction },
    );

    await queryInterface.createTable(
      "post_comments",
      {
        id: { type: DataTypes.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true },
        post_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: { model: "posts", key: "id" },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
        author_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: { model: "users", key: "id" },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
        parent_id: {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: { model: "post_comments", key: "id" },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
        content: { type: DataTypes.TEXT, allowNull: false },
        ...timestamps,
      },
      { transaction },
    );
    await queryInterface.sequelize.query(
      "ALTER TABLE post_comments ADD CONSTRAINT post_comments_content_valid CHECK (char_length(btrim(content)) BETWEEN 1 AND 2000);",
      { transaction },
    );
    await queryInterface.addIndex("post_comments", ["post_id", "created_at"], {
      name: "post_comments_post_created_at_idx",
      transaction,
    });
    await queryInterface.addIndex("post_comments", ["parent_id"], {
      name: "post_comments_parent_id_idx",
      transaction,
    });

    await queryInterface.createTable(
      "post_polls",
      {
        id: { type: DataTypes.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true },
        post_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          unique: true,
          references: { model: "posts", key: "id" },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
        question: { type: DataTypes.STRING(300), allowNull: false },
        ...timestamps,
      },
      { transaction },
    );
    await queryInterface.sequelize.query(
      "ALTER TABLE post_polls ADD CONSTRAINT post_polls_question_valid CHECK (char_length(btrim(question)) > 0);",
      { transaction },
    );

    await queryInterface.createTable(
      "post_poll_options",
      {
        id: { type: DataTypes.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true },
        poll_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: { model: "post_polls", key: "id" },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
        label: { type: DataTypes.STRING(120), allowNull: false },
        position: { type: DataTypes.SMALLINT, allowNull: false },
        created_at: timestamps.created_at,
      },
      { transaction },
    );
    await queryInterface.sequelize.query(
      "ALTER TABLE post_poll_options ADD CONSTRAINT post_poll_options_values_valid CHECK (char_length(btrim(label)) > 0 AND position >= 0);",
      { transaction },
    );
    await queryInterface.addConstraint("post_poll_options", {
      fields: ["poll_id", "position"],
      type: "unique",
      name: "post_poll_options_poll_position_unique",
      transaction,
    });

    await queryInterface.createTable(
      "post_poll_votes",
      {
        id: { type: DataTypes.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true },
        poll_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: { model: "post_polls", key: "id" },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
        option_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: { model: "post_poll_options", key: "id" },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
        user_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: { model: "users", key: "id" },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
        created_at: timestamps.created_at,
        updated_at: timestamps.updated_at,
      },
      { transaction },
    );
    await queryInterface.addConstraint("post_poll_votes", {
      fields: ["poll_id", "user_id"],
      type: "unique",
      name: "post_poll_votes_poll_user_unique",
      transaction,
    });
    await queryInterface.addIndex("post_poll_votes", ["option_id"], {
      name: "post_poll_votes_option_id_idx",
      transaction,
    });
  });
}

export async function down({ context: queryInterface }) {
  await queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.dropTable("post_poll_votes", { transaction });
    await queryInterface.dropTable("post_poll_options", { transaction });
    await queryInterface.dropTable("post_polls", { transaction });
    await queryInterface.dropTable("post_comments", { transaction });
    await queryInterface.dropTable("post_likes", { transaction });
    await queryInterface.dropTable("posts", { transaction });
  });
}
