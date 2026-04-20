require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const admin = require('firebase-admin');

// Инициализация Firebase Admin SDK
try {
  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
      })
    });
    console.log('✅ Firebase Admin SDK инициализирован');
  } else {
    console.log('⚠️ Firebase не настроен (пуш-уведомления не будут работать)');
  }
} catch (error) {
  console.error('❌ Ошибка инициализации Firebase:', error.message);
}

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Подключение к MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/garage-service')
  .then(() => console.log('✅ MongoDB подключена'))
  .catch(err => console.error('❌ Ошибка подключения MongoDB:', err));

// Маршруты
app.use('/api/auth', require('./routes/auth'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/admin', require('./routes/admin'));

// Тестовый маршрут
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Гаражный автосервис API работает' });
});

// Обработка ошибок
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Что-то пошло не так!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
  console.log(`📍 API доступно по адресу: http://localhost:${PORT}/api`);
});
