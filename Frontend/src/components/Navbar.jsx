import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sprout, Menu, X, User } from 'lucide-react';
import axios from 'axios';

export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const phone = localStorage.getItem('farmerPhone');

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    // Attempt local cache first to avoid jank
    const cachedName = localStorage.getItem('farmerName');
    if (cachedName) setUserName(cachedName);

    if (token) {
      axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then((res) => {
        if (res.data.success && res.data.data.name) {
          setUserName(res.data.data.name);
          localStorage.setItem('farmerName', res.data.data.name);
        }
      }).catch(err => console.log('Could not fetch name:', err.message));
    }
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('farmerId');
    localStorage.removeItem('farmerPhone');
    localStorage.removeItem('farmerName');
    navigate('/login');
  };

  const closeMenu = () => setIsMobileMenuOpen(false);

  return (
    <nav className="navbar">
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
        <Link to="/" className="logo" onClick={closeMenu}>
          <Sprout className="text-primary" size={32} />
          <span className="logo-text">FarmVaani</span>
        </Link>
        
        <button 
          className="mobile-menu-btn"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
        
        <div className={`nav-links ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
          <Link to="/" className="nav-link" onClick={closeMenu}>Home</Link>
          <Link to="/mandi-rates" className="nav-link" onClick={closeMenu}>Mandi Rates</Link>
          <Link to="/community" className="nav-link" onClick={closeMenu}>Community</Link>
          <Link to="/advisory" className="nav-link" onClick={closeMenu}>Ask Advisory</Link>
          {token ? (
            <div className="nav-actions">
              <span className="auth-phone" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <User size={14} /> {userName || phone}
              </span>
              <button onClick={() => { handleLogout(); closeMenu(); }} className="btn btn-outline" style={{ padding: '0.4rem 1.5rem' }}>Logout</button>
            </div>
          ) : (
            <div className="nav-actions">
              <Link to="/login" className="btn btn-outline" onClick={closeMenu} style={{ padding: '0.5rem 1.2rem' }}>Login</Link>
              <Link to="/signup" className="btn btn-primary" onClick={closeMenu} style={{ padding: '0.5rem 1.2rem' }}>Sign Up</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
