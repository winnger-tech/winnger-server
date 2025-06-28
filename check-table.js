const { sequelize } = require('./src/config/database');

async function checkTables() {
  try {
    console.log('Checking existing tables...');
    
    const [results] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);
    
    console.log('\nExisting tables:');
    console.table(results);
    
  } catch (error) {
    console.error('❌ Error checking tables:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkTables(); 