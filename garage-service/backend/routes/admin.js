const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Order = require('../models/Order');
const admin = require('firebase-admin');

// Получение статистики (админ)
router.get('/stats', require('../middleware/auth'), async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Доступ запрещен' });
    }

    const totalClients = await User.countDocuments({ role: 'client' });
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    const completedOrders = await Order.countDocuments({ status: 'completed' });
    
    const revenue = await Order.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$price' } } }
    ]);

    res.json({
      totalClients,
      totalOrders,
      pendingOrders,
      completedOrders,
      revenue: revenue[0]?.total || 0
    });
  } catch (error) {
    console.error('Ошибка получения статистики:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Получение всех клиентов (админ)
router.get('/clients', require('../middleware/auth'), async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Доступ запрещен' });
    }

    const clients = await User.find({ role: 'client' }).select('-password').sort({ createdAt: -1 });
    res.json(clients);
  } catch (error) {
    console.error('Ошибка получения клиентов:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Рассылка пуш-уведомлений всем клиентам (админ)
router.post('/push-broadcast', require('../middleware/auth'), async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Доступ запрещен' });
    }

    const { title, body } = req.body;

    if (!title || !body) {
      return res.status(400).json({ message: 'Заголовок и текст обязательны' });
    }

    // Получаем всех пользователей с push-токенами
    const users = await User.find({ pushToken: { $ne: null } });
    
    if (users.length === 0) {
      return res.json({ message: 'Нет пользователей с push-токенами', sent: 0 });
    }

    const tokens = users.map(u => u.pushToken);
    
    if (admin.apps.length > 0) {
      const message = {
        notification: {
          title,
          body
        },
        tokens
      };

      const response = await admin.messaging().sendEachForMulticast(message);
      
      res.json({
        message: 'Рассылка выполнена',
        sent: response.successCount,
        failed: response.failureCount
      });
    } else {
      res.json({
        message: 'Firebase не настроен, рассылка не выполнена',
        sent: 0
      });
    }
  } catch (error) {
    console.error('Ошибка рассылки:', error);
    res.status(500).json({ message: 'Ошибка сервера при рассылке' });
  }
});

// Создание админа (первый вход или через существующего админа)
router.post('/create-admin', async (req, res) => {
  try {
    const { name, email, phone, password, secretKey } = req.body;

    // Проверка секретного ключа (для первого админа)
    if (secretKey !== process.env.ADMIN_SECRET_KEY) {
      return res.status(403).json({ message: 'Неверный секретный ключ' });
    }

    const existingAdmin = await User.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Пользователь уже существует' });
    }

    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = new User({
      name,
      email,
      phone,
      password: hashedPassword,
      role: 'admin'
    });

    await admin.save();

    res.status(201).json({ message: 'Админ создан', adminId: admin._id });
  } catch (error) {
    console.error('Ошибка создания админа:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

module.exports = router;
