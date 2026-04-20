const express = require('express');
const router = express.Router();
const User = require('../models/User');
const ServiceOrder = require('../models/ServiceOrder');
const Notification = require('../models/Notification');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// Dashboard statistics
router.get('/dashboard', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'client' });
    const totalOrders = await ServiceOrder.countDocuments();
    const pendingOrders = await ServiceOrder.countDocuments({ status: 'pending' });
    const inProgressOrders = await ServiceOrder.countDocuments({ status: 'in_progress' });
    const completedOrders = await ServiceOrder.countDocuments({ status: 'completed' });
    
    const revenue = await ServiceOrder.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    
    const recentOrders = await ServiceOrder.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('clientId', 'firstName lastName email');
    
    res.json({
      success: true,
      data: {
        statistics: {
          totalUsers,
          totalOrders,
          pendingOrders,
          inProgressOrders,
          completedOrders,
          totalRevenue: revenue[0]?.total || 0
        },
        recentOrders
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Get all users
router.get('/users', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 20, role } = req.query;
    
    const query = role ? { role } : {};
    
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const count = await User.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        users,
        pagination: {
          total: count,
          page: parseInt(page),
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Get all orders
router.get('/orders', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    
    const query = status ? { status } : {};
    
    const orders = await ServiceOrder.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('clientId', 'firstName lastName email phone');
    
    const count = await ServiceOrder.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          total: count,
          page: parseInt(page),
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Update user role
router.put('/users/:id/role', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!['client', 'admin', 'mechanic'].includes(role)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid role' 
      });
    }
    
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    user.role = role;
    user.updatedAt = Date.now();
    await user.save();
    
    res.json({
      success: true,
      message: 'User role updated successfully',
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        }
      }
    });
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Delete order
router.delete('/orders/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const order = await ServiceOrder.findByIdAndDelete(req.params.id);
    
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }
    
    res.json({
      success: true,
      message: 'Order deleted successfully'
    });
  } catch (error) {
    console.error('Delete order error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

module.exports = router;
