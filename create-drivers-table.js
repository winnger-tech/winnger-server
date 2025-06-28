const { sequelize } = require('./src/config/database');
const fs = require('fs');

async function createDriversTable() {
  try {
    console.log('Creating drivers table...');
    
    // Read the SQL file
    const sql = fs.readFileSync('./create-drivers-table.sql', 'utf8');
    
    // Execute the SQL
    await sequelize.query(sql);
    
    console.log('✅ Drivers table created successfully!');
    
    // Verify the table was created
    const [results] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'drivers' 
      ORDER BY ordinal_position;
    `);
    
    console.log('\nDrivers table structure:');
    console.table(results);
    
  } catch (error) {
    console.error('❌ Error creating drivers table:', error.message);
  } finally {
    await sequelize.close();
  }
}

createDriversTable(); 