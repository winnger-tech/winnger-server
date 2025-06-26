// updated_adminController.js
const { Driver, Restaurant, Admin } = require('../models'); // ✅ use this instead of individual files

//const Driver = require('../models/Driver');
//const Restaurant = require('../models/Restaurant');
//const {Admin} = require('../models');
const jwt = require('jsonwebtoken');
const { sendEmail } = require('../utils/email');
const { Op } = require('sequelize');
const ExcelJS = require('exceljs');
const json2csv = require('json2csv').parse;

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Please provide email and password' });
    const admin = await Admin.findOne({ where: { email } });
    if (!admin || !(await admin.comparePassword(password))) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    admin.lastLogin = new Date();
    await admin.save();
    const token = jwt.sign({ id: admin.id, role: admin.role }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.status(200).json({ 
      success: true, 
      type: 'admin',
      token, 
      data: { 
        id: admin.id, 
        name: admin.name, 
        email: admin.email, 
        role: admin.role, 
        lastLogin: admin.lastLogin 
      } 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const stats = {
      drivers: {
        total: await Driver.count(),
        pending: await Driver.count({ where: { status: 'pending' } }),
        approved: await Driver.count({ where: { status: 'approved' } }),
        rejected: await Driver.count({ where: { status: 'rejected' } }),
        paymentCompleted: await Driver.count({ where: { paymentStatus: 'completed' } })
      },
      restaurants: {
        total: await Restaurant.count(),
        pending: await Restaurant.count({ where: { status: 'pending' } }),
        approved: await Restaurant.count({ where: { status: 'approved' } }),
        rejected: await Restaurant.count({ where: { status: 'rejected' } }),
        paymentCompleted: await Restaurant.count({ where: { paymentStatus: 'completed' } })
      }
    };
    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllDrivers = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;
    const where = {};
    if (req.query.status) where.status = req.query.status;
    if (req.query.paymentStatus) where.paymentStatus = req.query.paymentStatus;
    if (req.query.startDate && req.query.endDate) {
      where.createdAt = { [Op.between]: [new Date(req.query.startDate), new Date(req.query.endDate)] };
    }
    if (req.query.search) {
      where[Op.or] = [
        { firstName: { [Op.iLike]: `%${req.query.search}%` } },
        { lastName: { [Op.iLike]: `%${req.query.search}%` } },
        { email: { [Op.iLike]: `%${req.query.search}%` } },
        { cellNumber: { [Op.iLike]: `%${req.query.search}%` } }
      ];
    }
    
    const total = await Driver.count({ where });
    const drivers = await Driver.findAll({ 
      where, 
      attributes: { 
        exclude: ['password'] 
      }, 
      limit, 
      offset, 
      order: [['createdAt', 'DESC']] 
    });
    
    res.status(200).json({ 
      success: true, 
      total, 
      count: drivers.length, 
      totalPages: Math.ceil(total / limit), 
      currentPage: page, 
      data: drivers 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllRestaurants = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;
    const where = {};
    if (req.query.status) where.status = req.query.status;
    if (req.query.paymentStatus) where.paymentStatus = req.query.paymentStatus;
    if (req.query.startDate && req.query.endDate) {
      where.createdAt = { [Op.between]: [new Date(req.query.startDate), new Date(req.query.endDate)] };
    }
    if (req.query.search) {
      where[Op.or] = [
        { restaurantName: { [Op.iLike]: `%${req.query.search}%` } },
        { ownerName: { [Op.iLike]: `%${req.query.search}%` } },
        { email: { [Op.iLike]: `%${req.query.search}%` } },
        { phone: { [Op.iLike]: `%${req.query.search}%` } }
      ];
    }
    
    const total = await Restaurant.count({ where });
    const restaurants = await Restaurant.findAll({ 
      where, 
      attributes: { 
        exclude: ['password'] 
      }, 
      limit, 
      offset, 
      order: [['createdAt', 'DESC']] 
    });
    
    res.status(200).json({ 
      success: true, 
      total, 
      count: restaurants.length, 
      totalPages: Math.ceil(total / limit), 
      currentPage: page, 
      data: restaurants 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get detailed driver information by ID
exports.getDriverById = async (req, res) => {
  try {
    const { id } = req.params;
    const driver = await Driver.findByPk(id, {
      attributes: { exclude: ['password'] }
    });
    
    if (!driver) {
      return res.status(404).json({ 
        success: false, 
        message: 'Driver not found' 
      });
    }
    
    res.status(200).json({ 
      success: true, 
      data: driver 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get detailed restaurant information by ID
exports.getRestaurantById = async (req, res) => {
  try {
    const { id } = req.params;
    const restaurant = await Restaurant.findByPk(id, {
      attributes: { exclude: ['password'] }
    });
    
    if (!restaurant) {
      return res.status(404).json({ 
        success: false, 
        message: 'Restaurant not found' 
      });
    }
    
    res.status(200).json({ 
      success: true, 
      data: restaurant 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all drivers with detailed information (no pagination for admin dashboard)
exports.getAllDriversDetailed = async (req, res) => {
  try {
    const where = {};
    if (req.query.status) where.status = req.query.status;
    if (req.query.paymentStatus) where.paymentStatus = req.query.paymentStatus;
    if (req.query.startDate && req.query.endDate) {
      where.createdAt = { [Op.between]: [new Date(req.query.startDate), new Date(req.query.endDate)] };
    }
    
    const drivers = await Driver.findAll({ 
      where, 
      attributes: { 
        exclude: ['password'] 
      }, 
      order: [['createdAt', 'DESC']] 
    });
    
    res.status(200).json({ 
      success: true, 
      count: drivers.length, 
      data: drivers 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all restaurants with detailed information (no pagination for admin dashboard)
exports.getAllRestaurantsDetailed = async (req, res) => {
  try {
    const where = {};
    if (req.query.status) where.status = req.query.status;
    if (req.query.paymentStatus) where.paymentStatus = req.query.paymentStatus;
    if (req.query.startDate && req.query.endDate) {
      where.createdAt = { [Op.between]: [new Date(req.query.startDate), new Date(req.query.endDate)] };
    }
    
    const restaurants = await Restaurant.findAll({ 
      where, 
      attributes: { 
        exclude: ['password'] 
      }, 
      order: [['createdAt', 'DESC']] 
    });
    
    res.status(200).json({ 
      success: true, 
      count: restaurants.length, 
      data: restaurants 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateDriverStatus = async (req, res) => {
  try {
    const { status, remarks } = req.body;
    const driver = await Driver.findByPk(req.params.id);
    if (!driver) return res.status(404).json({ success: false, message: 'Driver not found' });
    
    const previousStatus = driver.status;
    driver.status = status;
    if (remarks) driver.remarks = remarks;
    await driver.save();
    
    await sendEmail({ 
      email: driver.email, 
      subject: `Status Update: ${status.toUpperCase()}`, 
      message: `Your status is now: ${status.toUpperCase()}. ${remarks || ''}` 
    });
    
    res.status(200).json({ 
      success: true, 
      message: `Driver status updated from ${previousStatus} to ${status}`,
      data: {
        id: driver.id,
        email: driver.email,
        name: `${driver.firstName || ''} ${driver.lastName || ''}`.trim(),
        previousStatus,
        currentStatus: driver.status,
        remarks: driver.remarks,
        updatedAt: driver.updatedAt
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateRestaurantStatus = async (req, res) => {
  try {
    const { status, remarks } = req.body;
    const restaurant = await Restaurant.findByPk(req.params.id);
    if (!restaurant) return res.status(404).json({ success: false, message: 'Restaurant not found' });
    
    const previousStatus = restaurant.status;
    restaurant.status = status;
    if (remarks) {
      restaurant.rejectionReason = remarks;
    }
    await restaurant.save();
    
    await sendEmail({ 
      email: restaurant.email, 
      subject: `Status Update: ${status.toUpperCase()}`, 
      message: `Your status is now: ${status.toUpperCase()}. ${remarks || ''}` 
    });
    
    res.status(200).json({ 
      success: true, 
      message: `Restaurant status updated from ${previousStatus} to ${status}`,
      data: {
        id: restaurant.id,
        email: restaurant.email,
        name: restaurant.restaurantName || restaurant.ownerName,
        previousStatus,
        currentStatus: restaurant.status,
        rejectionReason: restaurant.rejectionReason,
        updatedAt: restaurant.updatedAt
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.exportData = async (req, res) => {
  try {
    const { type, format = 'csv', status, paymentStatus, startDate, endDate } = req.query;
    if (!['drivers', 'restaurants'].includes(type)) return res.status(400).json({ success: false, message: 'Invalid export type' });
    const Model = type === 'drivers' ? Driver : Restaurant;
    const where = {};
    if (status) where.status = status;
    if (paymentStatus) where.paymentStatus = paymentStatus;
    if (startDate && endDate) where.createdAt = { [Op.between]: [new Date(startDate), new Date(endDate)] };
    const data = await Model.findAll({ where, attributes: { exclude: ['password'] } });
    const formatted = data.map(item => ({
      ID: item.id,
      Name: item.firstName ? `${item.firstName} ${item.lastName}` : item.ownerName || item.restaurantName,
      Email: item.email,
      Phone: item.cellNumber || item.phone,
      Status: item.status,
      'Payment Status': item.paymentStatus,
      'Created At': item.createdAt.toISOString(),
      'Updated At': item.updatedAt.toISOString(),
      ...(type === 'drivers' ? { 'Vehicle Type': item.vehicleType, 'Delivery Type': item.deliveryType } : { City: item.city, Province: item.province })
    }));
    if (format === 'excel') {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet(type);
      sheet.addRow(Object.keys(formatted[0]));
      formatted.forEach(row => sheet.addRow(Object.values(row)));
      sheet.getRow(1).font = { bold: true };
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=${type}_${Date.now()}.xlsx`);
      await workbook.xlsx.write(res);
    } else {
      const csv = json2csv(formatted);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=${type}_${Date.now()}.csv`);
      res.send(csv);
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update driver payment status
exports.updateDriverPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body;

    const driver = await Driver.findByPk(id);
    if (!driver) {
      return res.status(404).json({ success: false, error: 'Driver not found' });
    }

    let paymentStatus;
    switch (action) {
      case 'approve':
        paymentStatus = 'completed';
        break;
      case 'reject':
        paymentStatus = 'failed';
        break;
      case 'retry':
        paymentStatus = 'pending';
        break;
      default:
        return res.status(400).json({ success: false, error: 'Invalid action' });
    }

    await driver.update({ paymentStatus });
    await sendEmail({ 
      email: driver.email, 
      subject: `Payment Status Update: ${paymentStatus.toUpperCase()}`, 
      message: `Your payment status has been updated to: ${paymentStatus.toUpperCase()}` 
    });

    res.json({ success: true, data: { id, paymentStatus } });
  } catch (error) {
    console.error('Error updating driver payment:', error);
    res.status(500).json({ success: false, error: 'Failed to update payment status' });
  }
};

// Update restaurant payment status
exports.updateRestaurantPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body;

    const restaurant = await Restaurant.findByPk(id);
    if (!restaurant) {
      return res.status(404).json({ success: false, error: 'Restaurant not found' });
    }

    let paymentStatus;
    switch (action) {
      case 'approve':
        paymentStatus = 'completed';
        break;
      case 'reject':
        paymentStatus = 'failed';
        break;
      case 'retry':
        paymentStatus = 'pending';
        break;
      default:
        return res.status(400).json({ success: false, error: 'Invalid action' });
    }

    await restaurant.update({ paymentStatus });
    await sendEmail({ 
      email: restaurant.email, 
      subject: `Payment Status Update: ${paymentStatus.toUpperCase()}`, 
      message: `Your payment status has been updated to: ${paymentStatus.toUpperCase()}` 
    });

    res.json({ success: true, data: { id, paymentStatus } });
  } catch (error) {
    console.error('Error updating restaurant payment:', error);
    res.status(500).json({ success: false, error: 'Failed to update payment status' });
  }
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email and password'
      });
    }

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ where: { email } });
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Admin with this email already exists'
      });
    }

    // Create new admin
    const admin = await Admin.create({
      name,
      email,
      password,
      role: role || 'admin' // Default to 'admin' if role not specified
    });

    // Generate token
    const token = jwt.sign(
      { id: admin.id, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      success: true,
      type: 'admin',
      token,
      data: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Bulk update driver statuses
exports.bulkUpdateDriverStatus = async (req, res) => {
  try {
    const { driverIds, status, remarks } = req.body;
    
    if (!driverIds || !Array.isArray(driverIds) || driverIds.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide an array of driver IDs' 
      });
    }
    
    if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide a valid status' 
      });
    }

    const drivers = await Driver.findAll({ where: { id: driverIds } });
    
    if (drivers.length !== driverIds.length) {
      return res.status(400).json({ 
        success: false, 
        message: 'Some driver IDs were not found' 
      });
    }

    const updatePromises = drivers.map(async (driver) => {
      driver.status = status;
      if (remarks) driver.remarks = remarks;
      await driver.save();
      
      // Send email notification
      await sendEmail({ 
        email: driver.email, 
        subject: `Status Update: ${status.toUpperCase()}`, 
        message: `Your status has been updated to: ${status.toUpperCase()}. ${remarks || ''}` 
      });
      
      return driver;
    });

    const updatedDrivers = await Promise.all(updatePromises);

    res.status(200).json({ 
      success: true, 
      message: `Successfully updated ${updatedDrivers.length} drivers`,
      data: updatedDrivers 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Bulk update restaurant statuses
exports.bulkUpdateRestaurantStatus = async (req, res) => {
  try {
    const { restaurantIds, status, remarks } = req.body;
    
    if (!restaurantIds || !Array.isArray(restaurantIds) || restaurantIds.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide an array of restaurant IDs' 
      });
    }
    
    if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide a valid status' 
      });
    }

    const restaurants = await Restaurant.findAll({ where: { id: restaurantIds } });
    
    if (restaurants.length !== restaurantIds.length) {
      return res.status(400).json({ 
        success: false, 
        message: 'Some restaurant IDs were not found' 
      });
    }

    const updatePromises = restaurants.map(async (restaurant) => {
      restaurant.status = status;
      if (remarks) restaurant.rejectionReason = remarks;
      await restaurant.save();
      
      // Send email notification
      await sendEmail({ 
        email: restaurant.email, 
        subject: `Status Update: ${status.toUpperCase()}`, 
        message: `Your status has been updated to: ${status.toUpperCase()}. ${remarks || ''}` 
      });
      
      return restaurant;
    });

    const updatedRestaurants = await Promise.all(updatePromises);

    res.status(200).json({ 
      success: true, 
      message: `Successfully updated ${updatedRestaurants.length} restaurants`,
      data: updatedRestaurants 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Bulk update payment statuses
exports.bulkUpdateDriverPayment = async (req, res) => {
  try {
    const { driverIds, action } = req.body;
    
    if (!driverIds || !Array.isArray(driverIds) || driverIds.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide an array of driver IDs' 
      });
    }
    
    if (!action || !['approve', 'reject', 'retry'].includes(action)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide a valid action' 
      });
    }

    let paymentStatus;
    switch (action) {
      case 'approve': paymentStatus = 'completed'; break;
      case 'reject': paymentStatus = 'failed'; break;
      case 'retry': paymentStatus = 'pending'; break;
    }

    const drivers = await Driver.findAll({ where: { id: driverIds } });
    
    if (drivers.length !== driverIds.length) {
      return res.status(400).json({ 
        success: false, 
        message: 'Some driver IDs were not found' 
      });
    }

    const updatePromises = drivers.map(async (driver) => {
      await driver.update({ paymentStatus });
      
      // Send email notification
      await sendEmail({ 
        email: driver.email, 
        subject: `Payment Status Update: ${paymentStatus.toUpperCase()}`, 
        message: `Your payment status has been updated to: ${paymentStatus.toUpperCase()}` 
      });
      
      return { id: driver.id, paymentStatus };
    });

    const updatedDrivers = await Promise.all(updatePromises);

    res.status(200).json({ 
      success: true, 
      message: `Successfully updated payment status for ${updatedDrivers.length} drivers`,
      data: updatedDrivers 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.bulkUpdateRestaurantPayment = async (req, res) => {
  try {
    const { restaurantIds, action } = req.body;
    
    if (!restaurantIds || !Array.isArray(restaurantIds) || restaurantIds.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide an array of restaurant IDs' 
      });
    }
    
    if (!action || !['approve', 'reject', 'retry'].includes(action)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide a valid action' 
      });
    }

    let paymentStatus;
    switch (action) {
      case 'approve': paymentStatus = 'completed'; break;
      case 'reject': paymentStatus = 'failed'; break;
      case 'retry': paymentStatus = 'pending'; break;
    }

    const restaurants = await Restaurant.findAll({ where: { id: restaurantIds } });
    
    if (restaurants.length !== restaurantIds.length) {
      return res.status(400).json({ 
        success: false, 
        message: 'Some restaurant IDs were not found' 
      });
    }

    const updatePromises = restaurants.map(async (restaurant) => {
      await restaurant.update({ paymentStatus });
      
      // Send email notification
      await sendEmail({ 
        email: restaurant.email, 
        subject: `Payment Status Update: ${paymentStatus.toUpperCase()}`, 
        message: `Your payment status has been updated to: ${paymentStatus.toUpperCase()}` 
      });
      
      return { id: restaurant.id, paymentStatus };
    });

    const updatedRestaurants = await Promise.all(updatePromises);

    res.status(200).json({ 
      success: true, 
      message: `Successfully updated payment status for ${updatedRestaurants.length} restaurants`,
      data: updatedRestaurants 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
