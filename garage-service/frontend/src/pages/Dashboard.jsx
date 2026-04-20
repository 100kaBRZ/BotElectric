import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ordersAPI } from '../api';

function Dashboard({ userRole, logout }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await ordersAPI.getMyOrders();
      setOrders(response.data);
    } catch (err) {
      console.error('Ошибка получения заказов:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      pending: 'В ожидании',
      in_progress: 'В работе',
      completed: 'Выполнен',
      cancelled: 'Отменен'
    };
    return statusMap[status] || status;
  };

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <div>
      <nav className="navbar">
        <h2>🔧 Гаражный Автосервис</h2>
        <div>
          <span style={{ marginRight: '15px' }}>Привет, {user.name}!</span>
          {userRole === 'admin' && (
            <Link to="/admin" style={{ marginRight: '15px' }}>Админка</Link>
          )}
          <Link to="/orders">Мои заказы</Link>
          <a href="#" onClick={logout} style={{ marginLeft: '15px' }}>Выход</a>
        </div>
      </nav>

      <div className="container">
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <h1>Добро пожаловать в Гаражный Автосервис!</h1>
          <p style={{ margin: '20px 0', color: '#666' }}>
            Ваш надежный партнер в обслуживании автомобиля
          </p>
          
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginTop: '30px' }}>
            <Link to="/create-order" className="btn btn-primary">
              Создать заказ
            </Link>
            <Link to="/orders" className="btn btn-success">
              Мои заказы
            </Link>
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '20px' }}>Последние заказы</h3>
          
          {loading ? (
            <p>Загрузка...</p>
          ) : orders.length === 0 ? (
            <p style={{ color: '#666' }}>У вас пока нет заказов</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8f9fa', textAlign: 'left' }}>
                    <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>Авто</th>
                    <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>Услуга</th>
                    <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>Статус</th>
                    <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>Дата</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 5).map(order => (
                    <tr key={order._id}>
                      <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
                        {order.carModel} ({order.licensePlate})
                      </td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
                        {order.serviceType}
                      </td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
                        <span className={`status-${order.status}`}>
                          {getStatusText(order.status)}
                        </span>
                      </td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
                        {new Date(order.createdAt).toLocaleDateString('ru-RU')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
