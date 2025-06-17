'use strict';

const bcrypt = require('bcryptjs');
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);
    await queryInterface.bulkInsert('Admins', [{
      id: '00000000-0000-0000-0000-000000000000',
      name: 'Super Admin',
      email: 'admin@prlaunch.com',
      password: hashedPassword,
      role: 'super-admin',
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Admins', {
      email: 'admin@prlaunch.com'
    }, {});
  }
};