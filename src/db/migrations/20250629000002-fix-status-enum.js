'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async (transaction) => {
      // 1. Create new enum type
      await queryInterface.sequelize.query(`
        CREATE TYPE "enum_restaurants_status_new" AS ENUM ('pending', 'pending_approval', 'approved', 'rejected', 'suspended');
      `, { transaction });

      // 2. Drop default
      await queryInterface.sequelize.query(`
        ALTER TABLE "restaurants" ALTER COLUMN "status" DROP DEFAULT;
      `, { transaction });

      // 3. Change to TEXT
      await queryInterface.sequelize.query(`
        ALTER TABLE "restaurants" ALTER COLUMN "status" TYPE TEXT;
      `, { transaction });

      // 4. Change to new enum
      await queryInterface.sequelize.query(`
        ALTER TABLE "restaurants" ALTER COLUMN "status" TYPE "enum_restaurants_status_new" USING ("status"::"enum_restaurants_status_new");
      `, { transaction });

      // 5. Set default back
      await queryInterface.sequelize.query(`
        ALTER TABLE "restaurants" ALTER COLUMN "status" SET DEFAULT 'pending';
      `, { transaction });

      // 6. Drop old enum
      await queryInterface.sequelize.query(`
        DROP TYPE "enum_restaurants_status";
      `, { transaction });

      // 7. Rename new enum
      await queryInterface.sequelize.query(`
        ALTER TYPE "enum_restaurants_status_new" RENAME TO "enum_restaurants_status";
      `, { transaction });
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async (transaction) => {
      // 1. Create old enum type
      await queryInterface.sequelize.query(`
        CREATE TYPE "enum_restaurants_status_old" AS ENUM ('pending', 'approved', 'rejected', 'suspended');
      `, { transaction });

      // 2. Drop default
      await queryInterface.sequelize.query(`
        ALTER TABLE "restaurants" ALTER COLUMN "status" DROP DEFAULT;
      `, { transaction });

      // 3. Change to TEXT
      await queryInterface.sequelize.query(`
        ALTER TABLE "restaurants" ALTER COLUMN "status" TYPE TEXT;
      `, { transaction });

      // 4. Change to old enum
      await queryInterface.sequelize.query(`
        ALTER TABLE "restaurants" ALTER COLUMN "status" TYPE "enum_restaurants_status_old" USING ("status"::"enum_restaurants_status_old");
      `, { transaction });

      // 5. Set default back
      await queryInterface.sequelize.query(`
        ALTER TABLE "restaurants" ALTER COLUMN "status" SET DEFAULT 'pending';
      `, { transaction });

      // 6. Drop new enum
      await queryInterface.sequelize.query(`
        DROP TYPE "enum_restaurants_status";
      `, { transaction });

      // 7. Rename old enum
      await queryInterface.sequelize.query(`
        ALTER TYPE "enum_restaurants_status_old" RENAME TO "enum_restaurants_status";
      `, { transaction });
    });
  }
}; 