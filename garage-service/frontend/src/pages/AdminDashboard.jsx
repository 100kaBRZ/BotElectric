import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI, ordersAPI } from '../api';

function AdminDashboard({ logout }) {
  const [stats, setStats] = useState(null);
  const [clients, setClients] = useState([]);
  const [broadcast, setBroadcast] = useState({ title: '', body: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchClients();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await adminAPI.getStats();
      setStats(response.data);
    } catch (err) {
      console.error('Ошибка получения статистики:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const response = await adminAPI.getClients();
      setClients(response.data);
    } catch (err) {
      console.error('Ошибка получения клиентов:', err);
    }
  };

  const handleBroadcast = async (e) => {
    e.preventDefault();
    try {
      const response = await adminAPI.sendBroadcast(broadcast);
      alert(`Рассылка выполнена! Отправлено: ${response.data.sent}, Ошибок: ${response.data.failed}`);
      setBroadcast({ title: '', body: '' });
    } catch (err) {
      alert('Ошибка рассылки: ' + (err.response?.data?.message || err.message));
    }
  };

  if (loading) return <div style={{ padding: '50px' }}>Загрузка...</div>;

  return (
    <div>
      <nav className="navbar">
        <h2>🔧 Админ-панель</h2>
        <div>
          <Link to="/dashboard" style={{ marginRight: '15px' }}>На главную</Link>
          <Link to="/orders" style={{ marginRight: '15px' }}>Заказы</Link>
          <a href="#" onClick={logout}>Выход</a>
        </div>
      </nav>

      <div className="container">
        {/* Статистика */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
          <div className="card" style={{ textAlign: 'center' }}>
            <h3 style={{ color: '#007bff' }}>{stats.totalClients}</h3>
            <p>Клиентов</p>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <h3 style={{ color: '#28a745' }}>{stats.totalOrders}</h3>
            <p>Всего заказов</p>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <h3 style={{ color: '#ffc107' }}>{stats.pendingOrders}</h3>
            <p>В ожидании</p>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <h3 style={{ color: '#17a2b8' }}>{stats.completedOrders}</h3>
            <p>Выполнено</p>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <h3 style={{ color: '#dc3545' }}>{stats.revenue} ₽</h3>
            <p>Выручка</p>
          </div>
        </div>

        {/* Рассылка */}
        <div className="card">
          <h3 style={{ marginBottom: '20px' }}>📬 Рассылка пуш-уведомлений</h3>
          <form onSubmit={handleBroadcast}>
            <div className="form-group">
              <label>Заголовок</label>
              <input
                type="text"
                value={broadcast.title}
                onChange={(e) => setBroadcast({ ...broadcast, title: e.target.value })}
                placeholder="Например: Акция месяца!"
                required
              />
            </div>
            <div className="form-group">
              <label>Текст уведомления</label>
              <textarea
                value={broadcast.body}
                onChange={(e) => setBroadcast({ ...broadcast, body: e.target.value })}
                placeholder="Текст уведомления..."
                rows="3"
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '16px' }}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary">
              Отправить всем
            </button>
          </form>
        </div>

        {/* Список клиентов */}
        <div className="card" style={{ marginTop: '20px' }}>
          <h3 style={{ marginBottom: '20px' }}>👥 Клиенты ({clients.length})</h3>
          
          {clients.length === 0 ? (
            <p style={{ color: '#666' }}>Клиентов пока нет</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8f9fa', textAlign: 'left' }}>
                    <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>Имя</th>
                    <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>Email</th>
                    <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>Телефон</th>
                    <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>Дата регистрации</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map(client => (
                    <tr key={client._id}>
                      <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>{client.name}</td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>{client.email}</td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>{client.phone}</td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
                        {new Date(client.createdAt).toLocaleDateString('ru-RU')}
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

export default AdminDashboard;
