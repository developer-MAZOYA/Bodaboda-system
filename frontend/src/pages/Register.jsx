import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api.js';
import storage from '../services/storage.js';

export default function Register() {
  // Remove username field - it doesn't exist in database
  const [f, setF] = useState({ 
    fullName: '',      // Maps to full_name in DB
    email: '', 
    phoneNumber: '',   // Maps to phone_number in DB
    password: '', 
    role: 'CUSTOMER' 
  });
  
  const [err, setErr] = useState(''); 
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();
  
  const upd = k => e => setF({...f, [k]: e.target.value});
  
  const submit = async (e) => {
    e.preventDefault(); 
    setErr('');
    setLoading(true);
    
    // Validate required fields (no username)
    if (!f.fullName || !f.email || !f.phoneNumber || !f.password) {
      setErr('All fields are required');
      setLoading(false);
      return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(f.email)) {
      setErr('Please enter a valid email address');
      setLoading(false);
      return;
    }
    
    // Validate password length
    if (f.password.length < 6) {
      setErr('Password must be at least 6 characters');
      setLoading(false);
      return;
    }
    
    try {
      console.log('Sending registration data:', f);
      const { data } = await api.post('/auth/register', f);
      console.log('Registration response:', data);
      
      // Store token and user info
      storage.setItem('token', data.token);
      storage.setItem('role', data.role);
      storage.setItem('email', data.email);
      storage.setItem('fullName', data.fullName);
      
      // Redirect to dashboard
      nav('/');
    } catch (error) { 
      console.error('Registration error:', error);
      console.error('Error response:', error.response?.data);
      
      // Display specific error message from backend
      let message = 'Registration failed. Please try again.';
      
      if (error.response?.data?.message) {
        message = error.response.data.message;
      } else if (error.response?.data?.errors) {
        // Handle validation errors
        const errors = error.response.data.errors;
        message = Object.values(errors).join(', ');
      } else if (error.message) {
        message = error.message;
      }
      
      setErr(message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="row justify-content-center">
      <div className="col-md-6">
        <div className="card shadow-sm">
          <div className="card-body">
            <h3 className="mb-3">Create account</h3>
            
            {err && (
              <div className="alert alert-danger alert-dismissible fade show" role="alert">
                {err}
                <button type="button" className="btn-close" onClick={() => setErr('')}></button>
              </div>
            )}
            
            <form onSubmit={submit}>
              <input 
                type="text" 
                className="form-control mb-2" 
                placeholder="Full Name" 
                value={f.fullName} 
                onChange={upd('fullName')} 
                required 
                disabled={loading}
              />
              
              <input 
                type="email" 
                className="form-control mb-2" 
                placeholder="Email Address" 
                value={f.email} 
                onChange={upd('email')} 
                required 
                disabled={loading}
              />
              
              <input 
                type="tel" 
                className="form-control mb-2" 
                placeholder="Phone Number" 
                value={f.phoneNumber} 
                onChange={upd('phoneNumber')} 
                required 
                disabled={loading}
              />
              
              <input 
                type="password" 
                className="form-control mb-2" 
                placeholder="Password (min. 6 characters)" 
                value={f.password} 
                onChange={upd('password')} 
                required 
                disabled={loading}
              />
              
              <select 
                className="form-select mb-3" 
                value={f.role} 
                onChange={upd('role')}
                disabled={loading}
              >
                <option value="CUSTOMER">Customer</option>
                <option value="RIDER">Rider</option>
                <option value="ADMIN">Admin</option>
              </select>
              
              <button 
                className="btn btn-success w-100" 
                type="submit"
                disabled={loading}
              >
                {loading ? 'Registering...' : 'Register'}
              </button>
            </form>
            
            <hr className="my-3" />
            
            <p className="text-center mb-0">
              Already have an account?{' '}
              <a href="/login" className="text-decoration-none">
                Login here
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}