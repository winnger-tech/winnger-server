module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // Only rename if the table 'Drivers' exists and 'drivers' does not
      const [results] = await queryInterface.sequelize.query(`
        SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'Drivers';
      `);
      const [resultsLower] = await queryInterface.sequelize.query(`
        SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'drivers';
      `);
      
      if (results && results.length > 0 && resultsLower && resultsLower.length === 0) {
        await queryInterface.sequelize.query('ALTER TABLE "Drivers" RENAME TO drivers;');
        console.log('✅ Renamed table "Drivers" to "drivers"');
      } else {
        console.log('ℹ️ Table "Drivers" does not exist or "drivers" already exists. No action taken.');
      }
    } catch (error) {
      console.log('ℹ️ Error during rename migration:', error.message);
      console.log('ℹ️ Continuing with migration...');
    }
  },
  
  async down(queryInterface, Sequelize) {
    try {
      // Only rename back if 'drivers' exists and 'Drivers' does not
      const [results] = await queryInterface.sequelize.query(`
        SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'drivers';
      `);
      const [resultsUpper] = await queryInterface.sequelize.query(`
        SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'Drivers';
      `);
      
      if (results && results.length > 0 && resultsUpper && resultsUpper.length === 0) {
        await queryInterface.sequelize.query('ALTER TABLE drivers RENAME TO "Drivers";');
        console.log('✅ Renamed table "drivers" back to "Drivers"');
      } else {
        console.log('ℹ️ Table "drivers" does not exist or "Drivers" already exists. No action taken.');
      }
    } catch (error) {
      console.log('ℹ️ Error during rename rollback:', error.message);
      console.log('ℹ️ Continuing with rollback...');
    }
  }
}; 