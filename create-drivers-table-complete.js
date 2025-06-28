const { sequelize } = require('./src/config/database');
const fs = require('fs');

async function createDriversTableComplete() {
  try {
    console.log('🚀 Creating complete drivers table...');
    
    // Read the SQL file
    const sql = fs.readFileSync('./create-drivers-table-complete.sql', 'utf8');
    
    // Execute the SQL
    await sequelize.query(sql);
    
    console.log('✅ Complete drivers table created successfully!');
    
    // Verify the table was created
    const [results] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'drivers' 
      ORDER BY ordinal_position;
    `);
    
    console.log('\n📋 Drivers table structure:');
    console.table(results.map(row => ({
      column: row.column_name,
      type: row.data_type,
      nullable: row.is_nullable === 'YES' ? 'NULL' : 'NOT NULL',
      default: row.column_default
    })));
    
    // Check for key columns
    const keyColumns = [
      'profilePhotoUrl',
      'middleName', 
      'appUniteNumber',
      'vehicleType',
      'deliveryType',
      'workEligibilityType',
      'backgroundCheckStatus',
      'emailVerified',
      'consentAndDeclarations'
    ];
    
    const existingColumns = results.map(row => row.column_name);
    const missingColumns = keyColumns.filter(col => !existingColumns.includes(col));
    
    if (missingColumns.length > 0) {
      console.log('\n❌ Missing columns:', missingColumns);
    } else {
      console.log('\n✅ All expected columns are present!');
    }
    
  } catch (error) {
    console.error('❌ Error creating drivers table:', error.message);
  } finally {
    await sequelize.close();
  }
}

createDriversTableComplete(); 