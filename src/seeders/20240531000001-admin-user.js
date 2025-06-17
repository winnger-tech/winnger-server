'use strict';
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    await queryInterface.bulkInsert('Admins', [{
      id: uuidv4(),
      name: 'Admin User',
      email: 'admin@prlaunch.com',
      password: hashedPassword,
      role: 'super_admin',
      createdAt: new Date(),
      updatedAt: new Date()
    }]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Admins', null, {});
  }
}; 