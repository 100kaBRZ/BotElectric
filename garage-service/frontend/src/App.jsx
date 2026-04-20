import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import Orders from './pages/Orders';
import CreateOrder from './pages/CreateOrder';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        setIsAuthenticated(true);
        setUserRole(user.role);
      } catch (e) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUserRole(null);
  };

  if (loading) {
    return <div style={{ padding: '50px', textAlign: 'center' }}>Загрузка...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={
          isAuthenticated ? <Navigate to="/dashboard" /> : <Login onLogin={() => checkAuth()} />
        } />
        <Route path="/register" element={
          isAuthenticated ? <Navigate to="/dashboard" /> : <Register />
        } />
        <Route path="/dashboard" element={
          isAuthenticated ? <Dashboard userRole={userRole} logout={logout} /> : <Navigate to="/login" />
        } />
        <Route path="/admin" element={
          isAuthenticated && userRole === 'admin' ? <AdminDashboard logout={logout} /> : <Navigate to="/dashboard" />
        } />
        <Route path="/orders" element={
          isAuthenticated ? <Orders userRole={userRole} logout={logout} /> : <Navigate to="/login" />
        } />
        <Route path="/create-order" element={
          isAuthenticated ? <CreateOrder logout={logout} /> : <Navigate to="/login" />
        } />
        <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
