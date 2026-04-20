const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// Initialize Firebase Admin SDK (if credentials are provided)
let firebaseApp;
try {
  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY) {
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
      })
    });
  }
} catch (error) {
  console.log('Firebase Admin SDK not initialized. Push notifications will use database only.');
}

// Send push notification to specific user
router.post('/send', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { userId, title, message, type, data } = req.body;
    
    if (!userId || !title || !message) {
      return res.status(400).json({ 
        success: false, 
        message: 'userId, title and message are required' 
      });
    }
    
    // Save notification to database
    const notification = new Notification({
      userId,
      title,
      message,
      type: type || 'custom',
      data
    });
    
    await notification.save();
    
    // Send push notification via Firebase
    if (firebaseApp) {
      const user = await User.findById(userId);
      
      if (user && user.pushTokens.length > 0) {
        const payload = {
          notification: {
            title,
            body: message
          },
          data: data || {},
          android: {
            priority: 'high'
          },
          apns: {
            headers: {
              'apns-priority': '10'
            }
          }
        };
        
        try {
          await admin.messaging().sendEachForMulticast({
            tokens: user.pushTokens,
            ...payload
          });
        } catch (pushError) {
          console.error('Push notification error:', pushError);
        }
      }
    }
    
    res.json({
      success: true,
      message: 'Notification sent successfully',
      data: { notification }
    });
  } catch (error) {
    console.error('Send notification error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Broadcast notification to all users
router.post('/broadcast', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { title, message, type, data } = req.body;
    
    if (!title || !message) {
      return res.status(400).json({ 
        success: false, 
        message: 'Title and message are required' 
      });
    }
    
    const users = await User.find({}).select('_id pushTokens');
    
    // Save notifications to database for all users
    const notifications = users.map(user => ({
      userId: user._id,
      title,
      message,
      type: type || 'promotion',
      data
    }));
    
    await Notification.insertMany(notifications);
    
    // Send push notifications via Firebase
    if (firebaseApp) {
      const allTokens = users.flatMap(user => user.pushTokens);
      
      if (allTokens.length > 0) {
        const payload = {
          notification: {
            title,
            body: message
          },
          data: data || {},
          android: {
            priority: 'high'
          },
          apns: {
            headers: {
              'apns-priority': '10'
            }
          }
        };
        
        try {
          await admin.messaging().sendEachForMulticast({
            tokens: allTokens,
            ...payload
          });
        } catch (pushError) {
          console.error('Broadcast push error:', pushError);
        }
      }
    }
    
    res.json({
      success: true,
      message: `Broadcast sent to ${users.length} users`,
      data: { count: users.length }
    });
  } catch (error) {
    console.error('Broadcast error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Get user notifications
router.get('/my', authMiddleware, async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);
    
    res.json({
      success: true,
      data: { notifications }
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Mark notification as read
router.patch('/:id/read', authMiddleware, async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      userId: req.user._id
    });
    
    if (!notification) {
      return res.status(404).json({ 
        success: false, 
        message: 'Notification not found' 
      });
    }
    
    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();
    
    res.json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Mark all notifications as read
router.post('/read-all', authMiddleware, async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user._id, isRead: false },
      { isRead: true, readAt: new Date() }
    );
    
    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Mark all read error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

module.exports = router;
