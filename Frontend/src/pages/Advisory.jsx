import React, { useState, useRef } from 'react';
import axios from 'axios';
import { MessageSquare, Send, ImagePlus, X } from 'lucide-react';

export default function Advisory() {
  const [crop, setCrop] = useState('');
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [imageBase64, setImageBase64] = useState(null);
  const fileInputRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageBase64(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

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
      const payload = { phone, crop, question };
      if (imageBase64) {
        payload.imageBase64 = imageBase64;
      }

      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/advisory/ask`, 
        payload,
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

          <div className="input-group mb-4">
             <label>Upload a photo of your crop (Optional)</label>
             <div className="flex items-center gap-4">
                <button 
                  type="button"
                  className="btn btn-outline"
                  onClick={() => fileInputRef.current?.click()}
                  style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}
                >
                  <ImagePlus size={18} /> Choose Photo
                </button>
                <input 
                  type="file" 
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                />
             </div>
             {imageBase64 && (
                <div style={{ marginTop: '1rem', position: 'relative', display: 'inline-block' }}>
                   <img src={imageBase64} alt="Crop preview" style={{ height: '100px', borderRadius: '8px', objectFit: 'cover' }} />
                   <button 
                     type="button" 
                     onClick={() => setImageBase64(null)}
                     style={{ position: 'absolute', top: '-10px', right: '-10px', background: 'rgba(255,0,0,0.8)', color: 'white', borderRadius: '50%', padding: '4px' }}
                   >
                     <X size={14} />
                   </button>
                </div>
             )}
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
