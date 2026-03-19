import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Car, MapPin, TrendingUp, Power } from 'tabler-icons-react';
import { useAuth } from '../context/AuthContext';
import './Layout.css';

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>AutoGestão</h2>
          {user && <p className="user-name">Bem-vindo, {user.nome}!</p>}
        </div>
        <nav className="sidebar-nav">
          <Link to="/" className={`nav-item ${isActive('/')}`}>
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </Link>
          <Link to="/clientes" className={`nav-item ${isActive('/clientes')}`}>
            <Users size={20} />
            <span>Clientes</span>
          </Link>
          <Link to="/veiculos" className={`nav-item ${isActive('/veiculos')}`}>
            <Car size={20} />
            <span>Veículos</span>
          </Link>
          <Link to="/locacoes" className={`nav-item ${isActive('/locacoes')}`}>
            <MapPin size={20} />
            <span>Locações</span>
          </Link>
          <Link to="/relatorios" className={`nav-item ${isActive('/relatorios')}`}>
            <TrendingUp size={20} />
            <span>Relatórios</span>
          </Link>
        </nav>
        <button className="logout-btn" onClick={handleLogout}>
          <Power size={20} />
          <span>Sair</span>
        </button>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
