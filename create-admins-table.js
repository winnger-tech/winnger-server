const { sequelize } = require('./src/config/database');

async function createAdminsTable() {
  try {
    console.log('Creating Admins table...');
    
    // Create the Admins table with fields that match the Admin model
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS "Admins" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "email" VARCHAR(255) NOT NULL UNIQUE,
        "password" VARCHAR(255) NOT NULL,
        "name" VARCHAR(255) NOT NULL,
        "role" VARCHAR(255) DEFAULT 'admin' NOT NULL,
        "lastLogin" TIMESTAMP,
        "createdAt" TIMESTAMP NOT NULL,
        "updatedAt" TIMESTAMP NOT NULL
      );
    `);
    
    // Add indexes
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS "Admins_email" ON "Admins" ("email");
      CREATE INDEX IF NOT EXISTS "Admins_role" ON "Admins" ("role");
    `);
    
    console.log('✅ Admins table created successfully!');
    
    // Verify the table was created
    const [results] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'Admins' 
      ORDER BY ordinal_position;
    `);
    
    console.log('\nAdmins table structure:');
    console.table(results);
    
  } catch (error) {
    console.error('❌ Error creating Admins table:', error.message);
  } finally {
    await sequelize.close();
  }
}

createAdminsTable(); 