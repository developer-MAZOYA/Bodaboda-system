import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api.js';
import storage from '../services/storage.js';
export default function Login() {
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const [err, setErr] = useState(''); const nav = useNavigate();
  const submit = async (e) => {
    e.preventDefault(); setErr('');
    try {
      const { data } = await api.post('/auth/login', { email, password });
      storage.setItem('token', data.token);
      storage.setItem('role', data.role);
      storage.setItem('name', data.fullName);
      nav('/');
    } catch (e) { setErr(e.response?.data?.message || 'Login failed'); }
  };
  return (
    <div className="row justify-content-center"><div className="col-md-5">
      <div className="card shadow-sm"><div className="card-body">
        <h3 className="mb-3">Login</h3>
        {err && <div className="alert alert-danger">{err}</div>}
        <form onSubmit={submit}>
          <input className="form-control mb-2" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
          <input type="password" className="form-control mb-3" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
          <button className="btn btn-primary w-100">Sign in</button>
        </form>
      </div></div>
    </div></div>
  );
}
