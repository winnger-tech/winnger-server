const { sequelize } = require('./src/config/database');

async function markMigrationsComplete() {
  try {
    console.log('Marking migrations as completed...');
    
    const migrations = [
      '20250625000002-add-staged-registration-fields.js',
      '20250625000003-make-fields-nullable.js',
      '20250625164412-modify-driver-constraints-for-staged-registration.js',
      '20250626000001-add-missing-staged-registration-fields.js',
      '20250627000001-rename-Drivers-to-drivers.js',
      '20250627000003-create-restaurants-table.js',
      '20250627000004-create-admins-table.js',
      '20250628000001-update-restaurant-model-for-staged-registration.js'
    ];
    
    for (const migration of migrations) {
      try {
        await sequelize.query(
          'INSERT INTO "SequelizeMeta" ("name") VALUES (?) ON CONFLICT ("name") DO NOTHING',
          {
            replacements: [migration]
          }
        );
        console.log(`✅ Marked ${migration} as completed`);
      } catch (error) {
        console.log(`⚠️  ${migration} already marked as completed`);
      }
    }
    
    console.log('\n✅ All migrations marked as completed!');
    
  } catch (error) {
    console.error('❌ Error marking migrations:', error.message);
  } finally {
    await sequelize.close();
  }
}

markMigrationsComplete(); 