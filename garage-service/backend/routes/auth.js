const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Регистрация клиента
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    // Проверка существующего пользователя
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Пользователь с таким email уже существует' });
    }

    // Хеширование пароля
    const hashedPassword = await bcrypt.hash(password, 10);

    // Создание пользователя
    const user = new User({
      name,
      email,
      phone,
      password: hashedPassword,
      role: 'client'
    });

    await user.save();

    // Генерация токена
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Регистрация успешна',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Ошибка регистрации:', error);
    res.status(500).json({ message: 'Ошибка сервера при регистрации' });
  }
});

// Вход
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Поиск пользователя
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Неверный email или пароль' });
    }

    // Проверка пароля
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Неверный email или пароль' });
    }

    // Генерация токена
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Вход выполнен успешно',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Ошибка входа:', error);
    res.status(500).json({ message: 'Ошибка сервера при входе' });
  }
});

// Получение профиля текущего пользователя
router.get('/profile', require('../middleware/auth'), async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }
    res.json(user);
  } catch (error) {
    console.error('Ошибка получения профиля:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Обновление push-токена
router.post('/push-token', require('../middleware/auth'), async (req, res) => {
  try {
    const { pushToken } = req.body;
    
    await User.findByIdAndUpdate(req.user.userId, { pushToken });
    
    res.json({ message: 'Push-токен обновлен' });
  } catch (error) {
    console.error('Ошибка обновления push-токена:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

module.exports = router;
