import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api.js';
import storage from '../services/storage.js';
export default function Register() {
  const [f, setF] = useState({ fullName:'', email:'', phone:'', password:'', role:'CUSTOMER' });
  const [err, setErr] = useState(''); const nav = useNavigate();
  const upd = k => e => setF({...f, [k]: e.target.value});
  const submit = async (e) => {
    e.preventDefault(); setErr('');
    try {
      const { data } = await api.post('/auth/register', f);
      storage.setItem('token', data.token);
      storage.setItem('role', data.role);
      nav('/');
    } catch (error) { 
      console.error('Registration error:', error);
      const message = error.response?.data?.message || error.message || 'Registration failed';
      setErr(message); 
    }
  };
  return (
    <div className="row justify-content-center"><div className="col-md-6">
      <div className="card shadow-sm"><div className="card-body">
        <h3 className="mb-3">Create account</h3>
        {err && <div className="alert alert-danger">{err}</div>}
        <form onSubmit={submit}>
          <input className="form-control mb-2" placeholder="Full name" value={f.fullName} onChange={upd('fullName')} />
          <input className="form-control mb-2" placeholder="Email" value={f.email} onChange={upd('email')} />
          <input className="form-control mb-2" placeholder="Phone" value={f.phone} onChange={upd('phone')} />
          <input type="password" className="form-control mb-2" placeholder="Password" value={f.password} onChange={upd('password')} />
          <select className="form-select mb-3" value={f.role} onChange={upd('role')}>
            <option value="CUSTOMER">Customer</option>
            <option value="RIDER">Rider</option>
            <option value="ADMIN">Admin</option>
          </select>
          <button className="btn btn-success w-100">Register</button>
        </form>
      </div></div>
    </div></div>
  );
}
