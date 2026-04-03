import React from 'react';

export default function Footer() {
  return (
    <footer style={{ background: 'var(--primary-dark)', color: 'var(--white)', padding: '3rem 0 1.5rem 0', marginTop: 'auto' }}>
      <div className="container">
        <div className="flex justify-between flex-col md:flex-row gap-8" style={{ marginBottom: '2rem', display: 'flex', flexWrap: 'wrap' }}>
          <div style={{ flex: '1', minWidth: '250px' }}>
            <h3 className="text-2xl mb-4 font-bold" style={{ fontFamily: 'var(--font-heading)' }}>FarmVaani</h3>
            <p style={{ color: 'rgba(255,255,255,0.7)' }}>
              Empowering agriculture through technology. Localized, smart, and accessible to every farmer in India.
            </p>
          </div>
          <div style={{ flex: '1', minWidth: '250px' }}>
             <h4 className="font-bold mb-4">Quick Links</h4>
             <ul style={{ listStyle: 'none', color: 'rgba(255,255,255,0.7)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
               <li><a href="/">Home</a></li>
               <li><a href="/advisory">Advisory</a></li>
               <li><a href="/login">Login</a></li>
             </ul>
          </div>
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem', textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem' }}>
          &copy; {new Date().getFullYear()} FarmVaani. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
