const { sequelize } = require('./src/config/database');
const path = require('path');
const fs = require('fs');

async function runMigrations() {
  try {
    console.log('🚀 Starting database migrations for staged registration...\n');

    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.\n');

    // Run migrations using Sequelize CLI
    const { exec } = require('child_process');
    const util = require('util');
    const execAsync = util.promisify(exec);

    console.log('📦 Running migrations...\n');

    // Run the migrations
    const { stdout, stderr } = await execAsync('npx sequelize-cli db:migrate', {
      cwd: process.cwd(),
      env: { ...process.env, NODE_ENV: process.env.NODE_ENV || 'development' }
    });

    if (stdout) {
      console.log('Migration output:', stdout);
    }

    if (stderr) {
      console.log('Migration warnings:', stderr);
    }

    console.log('✅ All migrations completed successfully!\n');

    // Verify the table structure
    console.log('🔍 Verifying table structure...\n');
    
    const [results] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'drivers' 
      ORDER BY ordinal_position;
    `);

    console.log('📋 Current drivers table structure:');
    console.table(results.map(row => ({
      column: row.column_name,
      type: row.data_type,
      nullable: row.is_nullable,
      default: row.column_default
    })));

    // Check for staged registration fields
    const stagedFields = [
      'registrationStage',
      'isRegistrationComplete', 
      'noofstages',
      'sinCardNumber',
      'transitNumber',
      'institutionNumber'
    ];

    const existingFields = results.map(row => row.column_name);
    const missingFields = stagedFields.filter(field => !existingFields.includes(field));

    if (missingFields.length > 0) {
      console.log('⚠️  Missing fields:', missingFields);
    } else {
      console.log('✅ All staged registration fields are present!');
    }

    console.log('\n🎉 Migration process completed successfully!');
    console.log('📝 The staged registration system is now ready to use.');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    
    if (error.message.includes('relation "drivers" does not exist')) {
      console.log('\n💡 The drivers table does not exist yet. You may need to:');
      console.log('   1. Create the initial migration for the drivers table');
      console.log('   2. Or run: npx sequelize-cli db:migrate:undo:all');
      console.log('   3. Then run: npx sequelize-cli db:migrate');
    }
    
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Run migrations if this file is executed directly
if (require.main === module) {
  runMigrations();
}

module.exports = { runMigrations }; 