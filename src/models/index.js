const { sequelize } = require('../config/database');
const { DataTypes } = require('sequelize');

// Import models
const AdminModel = require('./Admin');
const DriverModel = require('./Driver');
const RestaurantModel = require('./Restaurant');

// Initialize models
const models = {
  Admin: AdminModel(sequelize, DataTypes),
  Driver: DriverModel(sequelize, DataTypes),
  Restaurant: RestaurantModel(sequelize, DataTypes)
};


// Add model associations
Object.values(models).forEach(model => {
  if (model.associate) {
    model.associate(models);
  }
});

module.exports = {
  sequelize,
  ...models
};
