'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add 'incomplete' to the enum type if it doesn't exist
    await queryInterface.sequelize.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_type t
          JOIN pg_enum e ON t.oid = e.enumtypid
          WHERE t.typname = 'enum_restaurants_status' AND e.enumlabel = 'incomplete'
        ) THEN
          ALTER TYPE "enum_restaurants_status" ADD VALUE 'incomplete';
        END IF;
      END$$;
    `);
  },
  down: async (queryInterface, Sequelize) => {
    // You can't remove an enum value in Postgres easily, so leave this empty or document it.
    // Note: Removing enum values requires recreating the entire enum type
  }
};