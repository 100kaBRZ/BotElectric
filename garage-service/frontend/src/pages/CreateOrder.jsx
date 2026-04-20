import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ordersAPI } from '../api';

function CreateOrder({ logout }) {
  const [formData, setFormData] = useState({
    carModel: '',
    carYear: '',
    licensePlate: '',
    serviceType: '',
    description: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await ordersAPI.create(formData);
      alert('Заказ успешно создан!');
      navigate('/orders');
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка создания заказа');
    } finally {
      setLoading(false);
    }
  };

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <div>
      <nav className="navbar">
        <h2>🔧 Гаражный Автосервис</h2>
        <div>
          <Link to="/dashboard" style={{ marginRight: '15px' }}>На главную</Link>
          <a href="#" onClick={logout}>Выход</a>
        </div>
      </nav>

      <div className="container" style={{ maxWidth: '600px', marginTop: '30px' }}>
        <div className="card">
          <h2 style={{ marginBottom: '20px' }}>Создание заказа</h2>
          
          {error && (
            <div style={{ color: 'red', marginBottom: '15px', padding: '10px', background: '#ffe6e6', borderRadius: '5px' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Марка и модель автомобиля *</label>
              <input
                type="text"
                value={formData.carModel}
                onChange={(e) => setFormData({ ...formData, carModel: e.target.value })}
                placeholder="Например: Toyota Camry"
                required
              />
            </div>

            <div className="form-group">
              <label>Год выпуска</label>
              <input
                type="text"
                value={formData.carYear}
                onChange={(e) => setFormData({ ...formData, carYear: e.target.value })}
                placeholder="Например: 2020"
              />
            </div>

            <div className="form-group">
              <label>Госномер *</label>
              <input
                type="text"
                value={formData.licensePlate}
                onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value })}
                placeholder="Например: А123АА777"
                required
              />
            </div>

            <div className="form-group">
              <label>Тип услуги *</label>
              <select
                value={formData.serviceType}
                onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                required
              >
                <option value="">Выберите услугу</option>
                <option value="Диагностика">Диагностика</option>
                <option value="Замена масла">Замена масла</option>
                <option value="Ремонт двигателя">Ремонт двигателя</option>
                <option value="Ремонт ходовой">Ремонт ходовой</option>
                <option value="Замена тормозов">Замена тормозов</option>
                <option value="Шиномонтаж">Шиномонтаж</option>
                <option value="Электрика">Электрика</option>
                <option value="Другое">Другое</option>
              </select>
            </div>

            <div className="form-group">
              <label>Описание проблемы</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Опишите проблему подробно..."
                rows="4"
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '16px' }}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Создание...' : 'Создать заказ'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateOrder;
