import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sprout } from 'lucide-react';

export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const phone = localStorage.getItem('farmerPhone');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('farmerId');
    localStorage.removeItem('farmerPhone');
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="container flex justify-between items-center" style={{ width: '100%' }}>
        <Link to="/" className="logo">
          <Sprout className="text-primary" size={32} />
          FarmVaani
        </Link>
        
        <div className="nav-links">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/advisory" className="nav-link">Ask Advisory</Link>
          {token ? (
            <div className="flex items-center gap-4">
              <span className="text-sm font-bold text-primary">📱 {phone}</span>
              <button onClick={handleLogout} className="btn btn-outline" style={{ padding: '0.4rem 1rem' }}>Logout</button>
            </div>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline" style={{ padding: '0.5rem 1.2rem', marginLeft: '1rem' }}>Login</Link>
              <Link to="/signup" className="btn btn-primary" style={{ padding: '0.5rem 1.2rem' }}>Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
