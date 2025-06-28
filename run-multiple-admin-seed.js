const { sequelize } = require('./src/config/database');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

// Function to generate a random password
function generateRandomPassword(length = 12) {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}

// Function to generate a random name
function generateRandomName() {
  const firstNames = ['John', 'Jane', 'Mike', 'Sarah', 'David', 'Emma', 'James', 'Lisa', 'Robert', 'Maria'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
  
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  
  return `${firstName} ${lastName}`;
}

async function runMultipleAdminSeed() {
  try {
    console.log('Running multiple admin seeder...');
    
    const adminsToCreate = [];
    const numberOfAdmins = 5; // You can change this number
    
    console.log('Generating admin users with random IDs and passwords...');
    
    for (let i = 0; i < numberOfAdmins; i++) {
      const id = uuidv4();
      const password = generateRandomPassword();
      const name = generateRandomName();
      const email = `admin${i + 1}@winnger.com`;
      
      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      // Log the generated credentials
      console.log(`Generated Admin ${i + 1}:`);
      console.log(`  ID: ${id}`);
      console.log(`  Name: ${name}`);
      console.log(`  Email: ${email}`);
      console.log(`  Password: ${password}`);
      console.log(`  Role: admin`);
      console.log('---');
      
      adminsToCreate.push({
        id: id,
        name: name,
        email: email,
        password: hashedPassword,
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    
    // Insert all admins at once
    for (const admin of adminsToCreate) {
      await sequelize.query(`
        INSERT INTO "Admins" (id, name, email, password, role, "createdAt", "updatedAt")
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, {
        bind: [
          admin.id,
          admin.name,
          admin.email,
          admin.password,
          admin.role,
          admin.createdAt,
          admin.updatedAt
        ]
      });
    }
    
    console.log(`✅ Successfully created ${numberOfAdmins} admin users!`);
    console.log('Please save the above credentials securely!');
    
  } catch (error) {
    console.error('❌ Error running multiple admin seeder:', error.message);
  } finally {
    await sequelize.close();
  }
}

runMultipleAdminSeed(); 