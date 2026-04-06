import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UserPlus, MapPin } from 'lucide-react';

export default function Signup() {
  const [formData, setFormData] = useState({ 
    name: '', 
    phone: '', 
    password: '', 
    village: '', 
    crops: '', 
    lat: null, 
    lon: null 
  });
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // API expects crops as an array, so we split the comma-separated string
      const payload = {
        ...formData,
        crops: formData.crops.split(',').map(c => c.trim()).filter(Boolean)
      };

      // Since the backend provided handles Farmer without password in farmerController
      // but might use authController for User, we send all fields.
      // We will hit the farmers register API as requested by the user's snippet.
      // If auth is needed later, they can switch this to /api/auth/signup
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/farmers/register`, payload);
      alert('Registration successful! Please login with your credentials.');
      navigate('/login');
    } catch (error) {
      alert('Registration failed: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const getLocation = () => {
    setLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData({
            ...formData,
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
          setLocating(false);
          alert('Location captured successfully! 📍');
        },
        (error) => {
          console.error(error);
          setLocating(false);
          alert('Could not get location. Please allow location access.');
        }
      );
    } else {
      setLocating(false);
      alert('Geolocation is not supported by your browser.');
    }
  };

  return (
    <div className="flex items-center justify-center py-24" style={{ minHeight: 'calc(100vh - 80px)', marginTop: '80px' }}>
      <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '500px' }}>
        <div className="text-center mb-8">
          <h2 className="text-4xl text-primary mb-2">Register Farmer</h2>
          <p className="text-muted">Join FarmVaani for smart weather & market alerts</p>
        </div>

        <form onSubmit={handleSignup}>
          <div className="flex gap-4" style={{ flexWrap: 'wrap' }}>
            <div className="input-group" style={{ flex: '1', minWidth: '200px' }}>
              <label>Full Name</label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="Ramesh Kumar" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>
            <div className="input-group" style={{ flex: '1', minWidth: '200px' }}>
              <label>Phone Number</label>
              <input 
                type="tel" 
                className="input-field" 
                placeholder="9876543210" 
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label>Password</label>
            <input 
              type="password" 
              className="input-field" 
              placeholder="••••••••" 
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
            />
          </div>

          <div className="input-group">
            <label>Village Name</label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="e.g. Palampur" 
              value={formData.village}
              onChange={(e) => setFormData({...formData, village: e.target.value})}
              required
            />
          </div>

          <div className="input-group">
            <label>Crops Grown (comma separated)</label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="e.g. Wheat, Rice, Sugarcane" 
              value={formData.crops}
              onChange={(e) => setFormData({...formData, crops: e.target.value})}
              required
            />
          </div>

          <div className="input-group">
            <label>Farm Location</label>
            <button 
              type="button" 
              onClick={getLocation} 
              className="btn btn-outline w-full"
              style={{ justifyContent: 'center', borderStyle: 'dashed' }}
            >
              <MapPin size={18} /> {locating ? 'Capturing...' : formData.lat ? `Location Set (${formData.lat.toFixed(2)}, ${formData.lon.toFixed(2)})` : 'Click to Capture Current Location'}
            </button>
            {!formData.lat && <small style={{ color: 'var(--text-muted)' }}>Required for accurate weather advisory</small>}
          </div>

          <button type="submit" className="btn btn-primary w-full mt-6" disabled={loading}>
            {loading ? 'Registering...' : <><UserPlus size={18} /> Register Farmer</>}
          </button>
        </form>

        <p className="text-center mt-6 text-sm">
          Already have an account? <Link to="/login" className="text-primary font-bold">Login</Link>
        </p>
      </div>
    </div>
  );
}
