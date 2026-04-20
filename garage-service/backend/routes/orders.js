const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const User = require('../models/User');
const admin = require('firebase-admin');

// Создание заказа (клиент)
router.post('/', require('../middleware/auth'), async (req, res) => {
  try {
    const { carModel, carYear, licensePlate, serviceType, description } = req.body;

    const order = new Order({
      clientId: req.user.userId,
      carModel,
      carYear,
      licensePlate,
      serviceType,
      description
    });

    await order.save();

    // Отправка пуш-уведомления админам
    const admins = await User.find({ role: 'admin' });
    if (admins.length > 0 && admin.apps.length > 0) {
      const tokens = admins.filter(a => a.pushToken).map(a => a.pushToken);
      if (tokens.length > 0) {
        const message = {
          notification: {
            title: 'Новый заказ',
            body: `Заказ от ${req.user.email}: ${serviceType}`
          },
          tokens
        };
        try {
          await admin.messaging().sendEachForMulticast(message);
        } catch (err) {
          console.error('Ошибка отправки push:', err);
        }
      }
    }

    res.status(201).json({
      message: 'Заказ создан',
      order
    });
  } catch (error) {
    console.error('Ошибка создания заказа:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Получение заказов клиента
router.get('/my', require('../middleware/auth'), async (req, res) => {
  try {
    const orders = await Order.find({ clientId: req.user.userId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error('Ошибка получения заказов:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Получение всех заказов (админ)
router.get('/', require('../middleware/auth'), async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Доступ запрещен' });
    }

    const orders = await Order.find().populate('clientId', 'name email phone').sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error('Ошибка получения заказов:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Обновление статуса заказа (админ)
router.patch('/:id/status', require('../middleware/auth'), async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Доступ запрещен' });
    }

    const { status, price } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Заказ не найден' });
    }

    order.status = status;
    if (price !== undefined) order.price = price;
    if (status === 'completed') order.completedAt = new Date();

    await order.save();

    // Отправка пуш-уведомления клиенту
    if (order.pushToken && admin.apps.length > 0) {
      const message = {
        token: order.pushToken,
        notification: {
          title: 'Статус заказа обновлен',
          body: `Ваш заказ (${order.serviceType}) теперь: ${status}`
        }
      };
      try {
        await admin.messaging().send(message);
      } catch (err) {
        console.error('Ошибка отправки push:', err);
      }
    }

    res.json({
      message: 'Статус обновлен',
      order
    });
  } catch (error) {
    console.error('Ошибка обновления статуса:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

module.exports = router;
