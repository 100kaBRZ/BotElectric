# Гаражный Автосервис - Приложение

Кроссплатформенное приложение для гаражного автосервиса с админ-панелью, push-уведомлениями и личным кабинетом клиента.

## 📋 Функционал

### Для клиентов:
- ✅ Регистрация и авторизация
- ✅ Личный кабинет с профилем
- ✅ Управление автомобилями
- ✅ Создание заявок на ремонт
- ✅ Просмотр статуса заказов
- ✅ Push-уведомления о статусе заказа

### Для администраторов/механиков:
- ✅ Админ-панель со статистикой
- ✅ Управление заказами
- ✅ Управление пользователями
- ✅ Рассылка push-уведомлений
- ✅ Изменение статусов заказов

## 🚀 Быстрый старт

### Вариант 1: Docker Compose (рекомендуется)

```bash
cd garage_service

# Скопируйте файл окружения
cp backend/.env.example backend/.env

# Отредактируйте backend/.env и заполните своими данными

# Запустите приложение
docker-compose up -d
```

Приложение будет доступно по адресу: http://localhost:3000

### Вариант 2: Локальный запуск

#### Требования:
- Node.js 18+
- MongoDB 6+

```bash
cd garage_service/backend

# Установите зависимости
npm install

# Скопируйте файл окружения
cp .env.example .env

# Отредактируйте .env и заполните своими данными

# Запустите сервер
npm start
```

## 🔧 Настройка переменных окружения

Откройте `backend/.env` и заполните:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/garage_service
JWT_SECRET=ваш-секретный-ключ-минимум-32-символа
FIREBASE_PROJECT_ID=ваш-project-id
FIREBASE_CLIENT_EMAIL=ваш-client-email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
```

### Настройка Firebase для push-уведомлений:

1. Создайте проект в [Firebase Console](https://console.firebase.google.com/)
2. Скачайте сервисный ключ (Settings → Service Accounts → Generate New Private Key)
3. Заполните переменные FIREBASE_* из полученного JSON-файла

## 📱 API Endpoints

### Аутентификация
- `POST /api/auth/register` - Регистрация нового пользователя
- `POST /api/auth/login` - Вход в систему
- `GET /api/auth/me` - Получить текущий профиль
- `POST /api/auth/push-token` - Сохранить токен для push-уведомлений

### Пользователь
- `GET /api/users/profile` - Получить профиль
- `PUT /api/users/profile` - Обновить профиль
- `POST /api/users/cars` - Добавить автомобиль
- `GET /api/users/cars` - Список автомобилей
- `DELETE /api/users/cars/:id` - Удалить автомобиль

### Заказы на ремонт
- `POST /api/services/` - Создать заказ
- `GET /api/services/my-orders` - Мои заказы
- `GET /api/services/:id` - Детали заказа
- `PATCH /api/services/:id/status` - Обновить статус (admin/mechanic)

### Уведомления
- `POST /api/notifications/send` - Отправить уведомление пользователю (admin)
- `POST /api/notifications/broadcast` - Массовая рассылка (admin)
- `GET /api/notifications/my` - Мои уведомления
- `PATCH /api/notifications/:id/read` - Пометить как прочитанное
- `POST /api/notifications/read-all` - Прочитать все

### Админ-панель
- `GET /api/admin/dashboard` - Статистика
- `GET /api/admin/users` - Список пользователей
- `GET /api/admin/orders` - Список заказов
- `PUT /api/admin/users/:id/role` - Изменить роль пользователя
- `DELETE /api/admin/orders/:id` - Удалить заказ

## 🐳 Развертывание на Amvera

Amvera поддерживает развертывание через Docker:

1. Создайте аккаунт на [Amvera](https://amvera.ru/)
2. Установите CLI: `npm install -g @amvera/cli`
3. Авторизуйтесь: `amvera login`
4. Инициализируйте проект: `amvera init`
5. Настройте переменные окружения в панели управления Amvera
6. Разверните: `amvera deploy`

### amvera.yaml (создайте в корне проекта):

```yaml
meta:
  environment: garage-service
  project: ваш-проект

build:
  type: docker
  dockerfile: backend/Dockerfile

run:
  containerPort: 3000
  env:
    - name: MONGODB_URI
      fromEnv: MONGODB_URI
    - name: JWT_SECRET
      fromEnv: JWT_SECRET
    - name: FIREBASE_PROJECT_ID
      fromEnv: FIREBASE_PROJECT_ID
    - name: FIREBASE_CLIENT_EMAIL
      fromEnv: FIREBASE_CLIENT_EMAIL
    - name: FIREBASE_PRIVATE_KEY
      fromEnv: FIREBASE_PRIVATE_KEY
```

## 📂 Структура проекта

```
garage_service/
├── backend/
│   ├── models/           # Модели данных
│   ├── routes/           # API маршруты
│   ├── middleware/       # Middleware функции
│   ├── services/         # Бизнес-логика
│   ├── server.js         # Точка входа
│   ├── package.json      # Зависимости
│   └── Dockerfile        # Docker конфигурация
├── frontend/             # Фронтенд (React Native / Flutter)
├── docker-compose.yml    # Docker Compose
└── README.md            # Документация
```

## 🔐 Безопасность

- Пароли хешируются с помощью bcrypt
- JWT токены для аутентификации
- Защита CORS
- Валидация входных данных
- Разделение ролей (client, admin, mechanic)

## 📞 Поддержка

Для вопросов и поддержки обращайтесь к документации или создайте issue в репозитории.

## 📄 Лицензия

MIT License
