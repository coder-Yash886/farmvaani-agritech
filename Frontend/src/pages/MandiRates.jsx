import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapPin, Search, Calendar, DollarSign, Loader2, ArrowUpDown } from 'lucide-react';

const STATES = ['', 'Uttar Pradesh', 'Madhya Pradesh', 'Maharashtra', 'Gujarat', 'Punjab', 'Haryana', 'Rajasthan'];
const COMMODITIES = ['', 'Wheat', 'Paddy(Dhan)(Common)', 'Potato', 'Tomato', 'Onion', 'Cotton', 'Maize'];

export default function MandiRates() {
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filters
  const [stateFilter, setStateFilter] = useState('Uttar Pradesh');
  const [districtFilter, setDistrictFilter] = useState('');
  const [commodityFilter, setCommodityFilter] = useState('');
  const [sortBy, setSortBy] = useState('latest'); // 'latest', 'highest'

  // Fetch data
  const fetchRates = async () => {
    setLoading(true);
    setError(null);
    try {
      let url = `${import.meta.env.VITE_API_BASE_URL}/api/mandi-rates?limit=50`;
      if (stateFilter) url += `&state=${encodeURIComponent(stateFilter)}`;
      if (districtFilter) url += `&district=${encodeURIComponent(districtFilter)}`;
      if (commodityFilter) url += `&commodity=${encodeURIComponent(commodityFilter)}`;

      const res = await axios.get(url);
      if (res.data.success) {
        setRates(res.data.data);
      } else {
        setRates([]);
      }
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setRates([]);
      } else {
        setError('Failed to fetch mandi rates. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Optionally auto-fetch on mount
    fetchRates();
    // eslint-disable-next-line
  }, []);

  // Sort the rates
  const sortedRates = [...rates].sort((a, b) => {
    if (sortBy === 'highest') {
      return b.modal_price - a.modal_price;
    } else {
      // Latest parsing is tricky with DD/MM/YYYY, let's assume raw string descending for simplicity 
      // or parse if it's DD/MM/YYYY format
      const dateA = a.arrival_date.split('/').reverse().join('');
      const dateB = b.arrival_date.split('/').reverse().join('');
      return dateB.localeCompare(dateA);
    }
  });

  return (
    <div className="pt-24 pb-16 min-h-screen">
      <div className="container">
        
        {/* Header Section */}
        <div className="text-center mb-10 animate-fade-in">
          <h1 className="text-4xl md-text-5xl text-primary-dark mb-4 drop-shadow-sm">
            Live Mandi Rates
          </h1>
          <p className="text-lg text-muted max-w-2xl mx-auto">
            Get real-time crop prices across India powered by Data.gov.in.
          </p>
        </div>

        {/* Filters Section (Glass Panel) */}
        <div className="glass-panel mb-12 animate-fade-in delay-100 max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            
            <div className="input-group mb-0">
              <label>State</label>
              <select className="input-field" value={stateFilter} onChange={e => setStateFilter(e.target.value)}>
                <option value="">All States</option>
                {STATES.filter(Boolean).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="input-group mb-0">
              <label>District</label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="e.g. Agra, Pune..." 
                value={districtFilter} 
                onChange={e => setDistrictFilter(e.target.value)} 
              />
            </div>

            <div className="input-group mb-0">
              <label>Commodity</label>
              <select className="input-field" value={commodityFilter} onChange={e => setCommodityFilter(e.target.value)}>
                <option value="">All Commodities</option>
                {COMMODITIES.filter(Boolean).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="flex items-end mb-0">
              <button 
                onClick={fetchRates} 
                disabled={loading}
                className="btn btn-primary w-full h-[52px]"
                style={{ height: '52px' }}
              >
                {loading ? <Loader2 className="animate-spin" /> : <Search />}
                Get Rates
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t" style={{ borderColor: 'rgba(0,0,0,0.05)' }}>
            <span className="text-sm text-muted">
              {rates.length} records found
            </span>
            <div className="flex items-center gap-2">
              <ArrowUpDown size={16} className="text-muted" />
              <select 
                className="input-field py-1 px-2 text-sm w-auto" 
                value={sortBy} 
                onChange={e => setSortBy(e.target.value)}
                style={{ padding: '0.4rem 1rem' }}
              >
                <option value="latest">Latest Date</option>
                <option value="highest">Highest Price</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error Handling */}
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-8 text-center border border-red-200">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin text-primary" size={48} />
          </div>
        )}

        {/* Results Grid */}
        {!loading && !error && sortedRates.length > 0 && (
          <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {sortedRates.map((rate, idx) => (
              <div 
                key={`${rate.market}-${rate.commodity}-${idx}`} 
                className="glass-panel" 
                style={{ transition: 'transform 0.2s', padding: '1.5rem' }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-bold text-primary-dark">{rate.commodity}</h3>
                  <span className="bg-primary-transparent text-primary px-3 py-1 rounded-full text-sm font-bold border border-green-200">
                    ₹{rate.modal_price} <span className="text-xs font-normal">/Qtl</span>
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">Min Price</span>
                    <span className="font-medium">₹{rate.min_price}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">Max Price</span>
                    <span className="font-medium">₹{rate.max_price}</span>
                  </div>
                </div>

                <div className="pt-3 border-t grid grid-cols-2 gap-2 text-sm" style={{ borderColor: 'rgba(0,0,0,0.05)' }}>
                  <div className="flex items-center gap-1 text-muted">
                    <MapPin size={14} className="text-secondary" />
                    <span className="truncate" title={`${rate.market}, ${rate.district}`}>{rate.market}</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted justify-end">
                    <Calendar size={14} className="text-secondary" />
                    <span>{rate.arrival_date}</span>
                  </div>
                  <div className="col-span-2 text-xs text-muted mt-1 opacity-75">
                    {rate.district}, {rate.state}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && sortedRates.length === 0 && (
          <div className="text-center py-20 glass-panel">
            <h3 className="text-2xl text-muted font-bold mb-2">No Mandi Rates Found</h3>
            <p className="text-muted">Try adjusting your filters or search for a different commodity/location.</p>
          </div>
        )}

      </div>
    </div>
  );
}
