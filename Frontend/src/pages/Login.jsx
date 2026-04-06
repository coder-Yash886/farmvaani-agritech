import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { LogIn } from 'lucide-react';

export default function Login() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/farmers/login`, { phone, password });
      
      // Save token and info to localStorage
      if (res.data.data && res.data.data.token) {
        localStorage.setItem('token', res.data.data.token);
        localStorage.setItem('farmerId', res.data.data.id);
        localStorage.setItem('farmerPhone', res.data.data.phone);
        if (res.data.data.name) {
          localStorage.setItem('farmerName', res.data.data.name);
        }
      }
      
      alert('Login successful! Welcome back.');
      navigate('/advisory'); // Redirect after successful login
    } catch (error) {
      alert('Login failed: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center py-24" style={{ minHeight: 'calc(100vh - 80px)', marginTop: '80px' }}>
      <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '450px' }}>
        <div className="text-center mb-8">
          <h2 className="text-4xl text-primary mb-2">Welcome Back</h2>
          <p className="text-muted">Enter your details to access your account</p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label>Phone Number</label>
            <input 
              type="tel" 
              className="input-field" 
              placeholder="e.g. 9876543210" 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input 
              type="password" 
              className="input-field" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary w-full mt-4" disabled={loading}>
            {loading ? 'Logging in...' : <><LogIn size={18} /> Login</>}
          </button>
        </form>

        <p className="text-center mt-6 text-sm">
          Don't have an account? <Link to="/signup" className="text-primary font-bold">Sign Up</Link>
        </p>
      </div>
    </div>
  );
}
