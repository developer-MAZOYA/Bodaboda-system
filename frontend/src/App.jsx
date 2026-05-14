import React from 'react';
import { Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';

function Nav() {
  const nav = useNavigate();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const logout = () => { localStorage.clear(); nav('/login'); };
  return (
    <nav className="navbar navbar-dark bg-dark px-3">
      <Link className="navbar-brand" to="/">🏍️ Bodaboda</Link>
      <div>
        {token ? (<>
          <span className="text-light me-3">Role: <span className="badge bg-primary">{role}</span></span>
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
  localStorage.getItem('token') ? children : <Navigate to="/login" />;

const AdminRoute = ({ children }) =>
  localStorage.getItem('token') && localStorage.getItem('role') === 'ADMIN'
    ? children
    : <Navigate to="/" replace />;

export default function App() {
  const role = localStorage.getItem('role');

  return (

    <>
      <Nav />
      <div className="container py-4">
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
      </div>
    </>
  );
}
