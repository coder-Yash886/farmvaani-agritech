import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Advisory from './pages/Advisory';
import MandiRates from './pages/MandiRates';
import Community from './pages/Community';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/mandi-rates" element={<MandiRates />} />
        <Route path="/community" element={<Community />} />
        <Route path="/advisory" element={<Advisory />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
