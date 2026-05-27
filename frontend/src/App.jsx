import React, { useEffect, useState } from 'react';
import { Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import storage from './services/storage.js';

function Nav() {
  const nav = useNavigate();
  const token = storage.getItem('token');
  const role = storage.getItem('role');
  const logout = () => { storage.clear(); nav('/login'); };
  return (
    <nav className="navbar app-navbar px-3">
      <Link className="navbar-brand" to="/">Bodaboda</Link>
      <div>
        {token ? (<>
          <span className="text-light me-3">Role: <span className="badge text-bg-light">{role}</span></span>
          <button className="btn btn-sm btn-outline-light" onClick={logout}>Logout</button>
        </>) : (<>
          <Link className="btn btn-sm btn-outline-light me-2" to="/login">Login</Link>
          <Link className="btn btn-sm btn-light" to="/register">Register</Link>
        </>)}
      </div>
    </nav>
  );
}

const Protected = ({ children }) =>
  storage.getItem('token') ? children : <Navigate to="/login" />;

const AdminRoute = ({ children }) =>
  storage.getItem('token') && storage.getItem('role') === 'ADMIN'
    ? children
    : <Navigate to="/" replace />;

export default function App() {
  const [, setAuthVersion] = useState(0);
  const role = storage.getItem('role');

  useEffect(() => {
    const refreshAuth = () => setAuthVersion((version) => version + 1);
    window.addEventListener('auth-storage-change', refreshAuth);
    window.addEventListener('storage', refreshAuth);
    return () => {
      window.removeEventListener('auth-storage-change', refreshAuth);
      window.removeEventListener('storage', refreshAuth);
    };
  }, []);

  return (
    <>
      <Nav />
      <main className="container-fluid app-container">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={
            <Protected>
              {role === 'ADMIN' ? <AdminDashboard /> : <Dashboard />}
            </Protected>
          } />
          <Route path="/admin" element={
            <AdminRoute><AdminDashboard /></AdminRoute>
          } />
        </Routes>
      </main>
    </>
  );
}
