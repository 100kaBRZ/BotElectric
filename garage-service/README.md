# Гаражный Автосервис - Приложение

## 📋 Описание
Кроссплатформенное приложение для управления гаражным автосервисом с:
- Личным кабинетом клиента
- Админ-панелью
- Системой заказов
- Push-уведомлениями через Firebase

## 🏗️ Структура проекта

```
garage-service/
├── backend/          # Node.js + Express API
│   ├── models/       # MongoDB модели
│   ├── routes/       # API маршруты
│   ├── middleware/   # Middleware (auth)
│   └── server.js     # Точка входа
└── frontend/         # React + Vite
    ├── src/
    │   ├── pages/    # Страницы приложения
    │   ├── components/
    │   ├── api.js    # API клиент
    │   └── App.jsx   # Главный компонент
    └── index.html

```

## 🚀 Быстрый старт

### 1. Backend (Node.js)

```bash
cd backend

# Создать файл .env
cp .env.example .env

# Отредактировать .env (MongoDB URI, JWT_SECRET, Firebase credentials)

# Установить зависимости
npm install

# Запустить сервер
npm run dev
```

Сервер запустится на `http://localhost:3000`

### 2. Frontend (React)

```bash
cd frontend

# Установить зависимости
npm install

# Запустить dev-сервер
npm run dev
```

Приложение откроется на `http://localhost:5173`

## 🔧 Настройка

### Переменные окружения (backend/.env)

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/garage-service
JWT_SECRET=ваш-секретный-ключ
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-client-email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
ADMIN_SECRET_KEY=секретный-ключ-для-создания-админа
```

### Создание первого админа

Отправьте POST запрос на `/api/admin/create-admin`:

```json
{
  "name": "Admin Name",
  "email": "admin@example.com",
  "phone": "+79990000000",
  "password": "admin123",
  "secretKey": "ваш-ADMIN_SECRET_KEY"
}
```

## 📱 API Endpoints

### Auth
- `POST /api/auth/register` - Регистрация клиента
- `POST /api/auth/login` - Вход
- `GET /api/auth/profile` - Получить профиль
- `POST /api/auth/push-token` - Обновить push-токен

### Orders
- `POST /api/orders` - Создать заказ
- `GET /api/orders/my` - Мои заказы
- `GET /api/orders` - Все заказы (админ)
- `PATCH /api/orders/:id/status` - Обновить статус (админ)

### Admin
- `GET /api/admin/stats` - Статистика
- `GET /api/admin/clients` - Список клиентов
- `POST /api/admin/push-broadcast` - Рассылка push-уведомлений
- `POST /api/admin/create-admin` - Создать админа

## 📦 Хостинг на Amvera

### Backend

1. Создайте `Dockerfile` в папке backend:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

2. Инициализируйте проект в Amvera:
```bash
amvera init
```

3. Настройте переменные окружения в панели Amvera

4. Задеплойте:
```bash
amvera deploy
```

### Frontend

1. Соберите приложение:
```bash
npm run build
```

2. Загрузите папку `dist` на статический хостинг Amvera

3. Настройте API_URL для production

## 🔔 Push-уведомления

Для работы push-уведомлений необходимо:

1. Создать проект в [Firebase Console](https://console.firebase.google.com/)
2. Скачать service account key JSON
3. Добавить credentials в `.env`
4. В мобильном приложении получить FCM token и отправить через `/api/auth/push-token`

## 📝 Функционал

### Для клиентов:
- ✅ Регистрация и вход
- ✅ Создание заказов на ремонт
- ✅ Просмотр истории заказов
- ✅ Получение push-уведомлений о статусе

### Для админов:
- ✅ Просмотр всех заказов
- ✅ Управление статусами заказов
- ✅ Статистика по сервису
- ✅ Список клиентов
- ✅ Массовая рассылка уведомлений

## 🛠️ Технологии

**Backend:**
- Node.js + Express
- MongoDB + Mongoose
- JWT аутентификация
- Firebase Admin SDK

**Frontend:**
- React 18
- React Router v7
- Axios
- Vite

## 📄 Лицензия
ISC
