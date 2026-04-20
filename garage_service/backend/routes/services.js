const express = require('express');
const router = express.Router();
const ServiceOrder = require('../models/ServiceOrder');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// Create service order
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { car, services, description, priority } = req.body;
    
    if (!description || !services || services.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Description and services are required' 
      });
    }
    
    const order = new ServiceOrder({
      clientId: req.user._id,
      car: car || req.user.cars[0],
      services,
      description,
      priority: priority || 'medium'
    });
    
    await order.save();
    
    res.status(201).json({
      success: true,
      message: 'Service order created successfully',
      data: { order }
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Get all orders for current user
router.get('/my-orders', authMiddleware, async (req, res) => {
  try {
    const orders = await ServiceOrder.find({ clientId: req.user._id })
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: { orders }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Get single order
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const order = await ServiceOrder.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }
    
    // Check if user owns this order or is admin
    if (order.clientId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied' 
      });
    }
    
    res.json({
      success: true,
      data: { order }
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Update order status (admin/mechanic only)
router.patch('/:id/status', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'mechanic') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied' 
      });
    }
    
    const { status, diagnosis, notes } = req.body;
    
    const order = await ServiceOrder.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }
    
    if (status) order.status = status;
    if (diagnosis) order.diagnosis = diagnosis;
    if (notes) order.notes = notes;
    if (status === 'in_progress' && !order.startDate) order.startDate = new Date();
    if (status === 'completed' && !order.endDate) order.endDate = new Date();
    
    order.updatedAt = Date.now();
    await order.save();
    
    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: { order }
    });
  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

module.exports = router;
