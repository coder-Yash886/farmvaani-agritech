import React from 'react';
import { Link } from 'react-router-dom';
import { Sprout, Phone, ShieldCheck, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero py-24" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
        <div className="container flex-col items-center text-center">
          <div className="animate-fade-in glass-panel" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div className="flex justify-center mb-6">
              <span style={{ 
                background: 'var(--primary-transparent)', 
                color: 'var(--primary)', 
                padding: '0.5rem 1rem', 
                borderRadius: 'var(--radius-full)',
                fontWeight: '600',
                fontSize: '0.875rem'
              }}>
                🌱 Empowering Indian Farmers
              </span>
            </div>
            
            <h1 className="md-text-6xl text-4xl mb-6 text-primary" style={{ color: 'var(--primary-dark)' }}>
              Awaaz Kisan Ki,<br />
              <span style={{ color: 'var(--primary)' }}>Pragati Desh Ki.</span>
            </h1>
            
            <p className="text-xl text-muted mb-8" style={{ maxWidth: '600px', margin: '0 auto 2rem auto' }}>
              Instant voice advisory, localized weather alerts, and smart market insights directly to your phone. FarmVaani is running to serve you!
            </p>
            
            <div className="flex justify-center gap-4 flex-wrap">
              <Link to="/signup" className="btn btn-primary">
                Get Started <ArrowRight size={18} />
              </Link>
              <Link to="/advisory" className="btn btn-outline">
                Try Advisory
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features py-24">
        <div className="container">
          <div className="text-center mb-16 animate-fade-in delay-100">
            <h2 className="text-4xl mb-4">Why FarmVaani?</h2>
            <p className="text-muted">Designed for simplicity, powered by advanced AI agritech.</p>
          </div>
          
          <div className="flex justify-center gap-8 flex-wrap">
            {/* Feature 1 */}
            <div className="glass-panel animate-fade-in delay-200" style={{ flex: '1', minWidth: '300px' }}>
              <div style={{ 
                width: '60px', height: '60px', 
                background: 'var(--secondary-light)', 
                color: 'var(--secondary)',
                borderRadius: 'var(--radius-md)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '1.5rem'
              }}>
                <Sprout size={32} />
              </div>
              <h3 className="text-2xl mb-2">Smart AI Advisory</h3>
              <p className="text-muted">Ask any farming related question and get expert advice in seconds.</p>
            </div>
            
            {/* Feature 2 */}
            <div className="glass-panel animate-fade-in delay-300" style={{ flex: '1', minWidth: '300px' }}>
              <div style={{ 
                width: '60px', height: '60px', 
                background: 'var(--primary-transparent)', 
                color: 'var(--primary)',
                borderRadius: 'var(--radius-md)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '1.5rem'
              }}>
                <Phone size={32} />
              </div>
              <h3 className="text-2xl mb-2">Voice & SMS Alerts</h3>
              <p className="text-muted">Receive critical weather and market alerts instantly on your mobile number.</p>
            </div>
            
            {/* Feature 3 */}
            <div className="glass-panel animate-fade-in delay-300" style={{ flex: '1', minWidth: '300px' }}>
              <div style={{ 
                width: '60px', height: '60px', 
                background: 'rgba(56, 189, 248, 0.1)', 
                color: '#0ea5e9',
                borderRadius: 'var(--radius-md)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '1.5rem'
              }}>
                <ShieldCheck size={32} />
              </div>
              <h3 className="text-2xl mb-2">Trusted by Farmers</h3>
              <p className="text-muted">Data backed by real agronomic research and localized weather stations.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
