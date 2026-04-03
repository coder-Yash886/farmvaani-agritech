import React, { useState } from 'react';
import axios from 'axios';
import { MessageSquare, Send } from 'lucide-react';

export default function Advisory() {
  const [crop, setCrop] = useState('');
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAsk = async (e) => {
    e.preventDefault();
    if (!question || !crop) return;
    
    setLoading(true);
    const phone = localStorage.getItem('farmerPhone');
    const token = localStorage.getItem('token');

    if (!phone || !token) {
      alert('Please login first to use AI Advisory.');
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/advisory/ask`, 
        { phone, crop, question },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setResponse(res.data.data.answer);
    } catch (error) {
      console.error(error);
      setResponse('Mafi chahte hain (Sorry), we could not fetch the advice. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-24" style={{ marginTop: '80px', minHeight: 'calc(100vh - 80px)' }}>
      <div className="glass-panel animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div className="flex items-center gap-4 mb-8 border-b pb-4" style={{ borderColor: 'rgba(0,0,0,0.1)' }}>
          <div style={{ padding: '1rem', background: 'var(--primary-transparent)', borderRadius: 'var(--radius-full)', color: 'var(--primary)' }}>
            <MessageSquare size={32} />
          </div>
          <div>
            <h2 className="text-4xl text-primary">AI Advisory</h2>
            <p className="text-muted">Ask anything about your crops, weather, or market rates</p>
          </div>
        </div>

        <form onSubmit={handleAsk} className="mb-8">
          <div className="input-group">
            <label>Which crop are you asking about?</label>
            <input 
              type="text" 
              className="input-field mb-4" 
              placeholder="e.g. Wheat, Tomato" 
              value={crop}
              onChange={(e) => setCrop(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>What's on your mind?</label>
            <div className="flex gap-4">
              <input 
                type="text" 
                className="input-field" 
                placeholder="Example: How to protect tomatoes from blight?" 
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              />
              <button type="submit" className="btn btn-primary" disabled={loading} style={{ padding: '0 2rem' }}>
                {loading ? 'Asking...' : <><Send size={20} /> Ask</>}
              </button>
            </div>
          </div>
        </form>

        {response && (
          <div className="animate-fade-in" style={{ 
            background: 'rgba(255, 255, 255, 0.9)', 
            padding: '2rem', 
            borderRadius: 'var(--radius-md)',
            borderLeft: '4px solid var(--primary)'
          }}>
            <h3 className="font-bold mb-2">Expert Advice:</h3>
            <p style={{ whiteSpace: 'pre-line' }}>{response}</p>
          </div>
        )}
      </div>
    </div>
  );
}
