import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ordersAPI } from '../api';

function Orders({ userRole, logout }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updateStatus, setUpdateStatus] = useState({});

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = userRole === 'admin' 
        ? await ordersAPI.getAllOrders() 
        : await ordersAPI.getMyOrders();
      setOrders(response.data);
    } catch (err) {
      console.error('Ошибка получения заказов:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await ordersAPI.updateStatus(orderId, { status: newStatus });
      alert('Статус обновлен!');
      fetchOrders();
    } catch (err) {
      alert('Ошибка обновления статуса');
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
          <Link to="/dashboard" style={{ marginRight: '15px' }}>На главную</Link>
          {userRole === 'admin' && (
            <Link to="/admin" style={{ marginRight: '15px' }}>Админка</Link>
          )}
          <a href="#" onClick={logout}>Выход</a>
        </div>
      </nav>

      <div className="container">
        <div className="card">
          <h2 style={{ marginBottom: '20px' }}>
            {userRole === 'admin' ? 'Все заказы' : 'Мои заказы'}
          </h2>

          {loading ? (
            <p>Загрузка...</p>
          ) : orders.length === 0 ? (
            <p style={{ color: '#666' }}>Заказов нет</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8f9fa', textAlign: 'left' }}>
                    <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>Клиент</th>
                    <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>Авто</th>
                    <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>Услуга</th>
                    <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>Цена</th>
                    <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>Статус</th>
                    <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>Дата</th>
                    {userRole === 'admin' && (
                      <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>Действия</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order._id}>
                      <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
                        {userRole === 'admin' 
                          ? `${order.clientId?.name || 'Неизвестно'}\n${order.clientId?.phone || ''}`
                          : '-'
                        }
                      </td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
                        {order.carModel} ({order.licensePlate})
                      </td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
                        {order.serviceType}
                      </td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
                        {order.price > 0 ? `${order.price} ₽` : '-'}
                      </td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
                        <span className={`status-${order.status}`}>
                          {getStatusText(order.status)}
                        </span>
                      </td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
                        {new Date(order.createdAt).toLocaleDateString('ru-RU')}
                      </td>
                      {userRole === 'admin' && (
                        <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusChange(order._id, e.target.value)}
                            style={{ padding: '5px', borderRadius: '3px' }}
                          >
                            <option value="pending">В ожидании</option>
                            <option value="in_progress">В работе</option>
                            <option value="completed">Выполнен</option>
                            <option value="cancelled">Отменен</option>
                          </select>
                        </td>
                      )}
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

export default Orders;
