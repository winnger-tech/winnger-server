const {
  Model,
  DataTypes
} = require('sequelize');
const bcrypt = require('bcryptjs');
module.exports = sequelize => {
  class Admin extends Model {
    static associate(models) {
      // Define associations here if needed
    }
    async comparePassword(candidatePassword) {
      console.log("Comparing", candidatePassword, "with", this.password);
      const match = await bcrypt.compare(candidatePassword, this.password);
      console.log("Password match?", match);
      return match;
    }
  }
  Admin.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    role: {
      type: DataTypes.ENUM('admin', 'super_admin'),
      defaultValue: 'admin'
    },
    lastLogin: {
      type: DataTypes.DATE
    }
  }, {
    sequelize,
    modelName: 'Admin',
    hooks: {
      beforeCreate: async admin => {
        if (admin.password) {
          const salt = await bcrypt.genSalt(10);
          admin.password = await bcrypt.hash(admin.password, salt);
        }
      },
      beforeUpdate: async admin => {
        if (admin.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          admin.password = await bcrypt.hash(admin.password, salt);
        }
      }
    }
  });
  return Admin;
};