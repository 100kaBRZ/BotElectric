const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// Get user profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          role: user.role,
          avatar: user.avatar,
          cars: user.cars,
          createdAt: user.createdAt
        }
      }
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Update user profile
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { firstName, lastName, phone, avatar } = req.body;
    
    const user = await User.findById(req.user._id);
    
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phone) user.phone = phone;
    if (avatar) user.avatar = avatar;
    
    user.updatedAt = Date.now();
    await user.save();
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          role: user.role,
          avatar: user.avatar
        }
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Add car to user profile
router.post('/cars', authMiddleware, async (req, res) => {
  try {
    const { make, model, year, vin, licensePlate } = req.body;
    
    if (!make || !model) {
      return res.status(400).json({ 
        success: false, 
        message: 'Make and model are required' 
      });
    }
    
    const user = await User.findById(req.user._id);
    
    user.cars.push({
      make,
      model,
      year,
      vin,
      licensePlate
    });
    
    user.updatedAt = Date.now();
    await user.save();
    
    res.json({
      success: true,
      message: 'Car added successfully',
      data: {
        cars: user.cars
      }
    });
  } catch (error) {
    console.error('Add car error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Get user's cars
router.get('/cars', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    res.json({
      success: true,
      data: {
        cars: user.cars
      }
    });
  } catch (error) {
    console.error('Get cars error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Delete car
router.delete('/cars/:carId', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    user.cars = user.cars.filter((_, index) => index !== parseInt(req.params.carId));
    user.updatedAt = Date.now();
    await user.save();
    
    res.json({
      success: true,
      message: 'Car deleted successfully',
      data: {
        cars: user.cars
      }
    });
  } catch (error) {
    console.error('Delete car error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

module.exports = router;
