const { sequelize } = require('./src/config/database');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

async function runAdminSeed() {
  try {
    console.log('Running admin seeder...');
    
    // Check if admin already exists
    const [existingAdmins] = await sequelize.query(`
      SELECT COUNT(*) as count FROM "Admins" WHERE email = 'admin@prlaunch.com'
    `);
    
    if (existingAdmins[0].count > 0) {
      console.log('✅ Admin user already exists!');
      return;
    }
    
    // Create admin user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);
    
    await sequelize.query(`
      INSERT INTO "Admins" (id, name, email, password, role, "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, {
      bind: [
        uuidv4(),
        'Admin User',
        'admin@prlaunch.com',
        hashedPassword,
        'super_admin',
        new Date(),
        new Date()
      ]
    });
    
    console.log('✅ Admin user created successfully!');
    console.log('Email: admin@prlaunch.com');
    console.log('Password: admin123');
    console.log('Role: super_admin');
    
  } catch (error) {
    console.error('❌ Error running admin seeder:', error.message);
  } finally {
    await sequelize.close();
  }
}

runAdminSeed(); 