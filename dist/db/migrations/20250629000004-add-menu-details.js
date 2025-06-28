'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Only add the column if it does not already exist
    await queryInterface.sequelize.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name='restaurants' AND column_name='menuDetails'
        ) THEN
          ALTER TABLE "restaurants" ADD COLUMN "menuDetails" JSONB DEFAULT '[]';
          COMMENT ON COLUMN "restaurants"."menuDetails" IS 'Restaurant menu items and details';
        END IF;
      END$$;
    `);
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('restaurants', 'menuDetails');
  }
};