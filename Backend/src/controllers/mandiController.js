const axios = require('axios');
const NodeCache = require('node-cache');

// Initialize cache with 1 hour TTL (Time To Live)
const mandiCache = new NodeCache({ stdTTL: 3600 });

exports.getMandiRates = async (req, res) => {
  try {
    const { state, district, commodity, limit = 20 } = req.query;

    // Cache key based on query params
    const cacheKey = `mandi_${state || 'all'}_${district || 'all'}_${commodity || 'all'}_${limit}`;
    
    // Check if data exists in cache
    const cachedData = mandiCache.get(cacheKey);
    if (cachedData) {
      return res.json({
        success: true,
        source: 'cache',
        count: cachedData.length,
        data: cachedData
      });
    }

    // Build the request to data.gov.in
    const apiKey = process.env.DATA_GOV_API_KEY || '579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b';
    let apiUrl = `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=${apiKey}&format=json&limit=${limit}`;

    // Add filters
    if (state) {
      apiUrl += `&filters[state]=${encodeURIComponent(state)}`;
    }
    if (district) {
      apiUrl += `&filters[district]=${encodeURIComponent(district)}`;
    }
    if (commodity) {
      apiUrl += `&filters[commodity]=${encodeURIComponent(commodity)}`;
    }

    // Fetch data
    const response = await axios.get(apiUrl);

    // If no records found
    if (!response.data || !response.data.records || response.data.records.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No mandi rates found for the given criteria.',
        data: []
      });
    }

    // Clean and transform the response
    const cleanData = response.data.records.map(record => ({
      commodity: record.commodity,
      market: record.market,
      district: record.district,
      state: record.state,
      min_price: parseInt(record.min_price),
      max_price: parseInt(record.max_price),
      modal_price: parseInt(record.modal_price),
      arrival_date: record.arrival_date
    }));

    // Save to cache
    mandiCache.set(cacheKey, cleanData);

    return res.json({
      success: true,
      source: 'api',
      count: cleanData.length,
      data: cleanData
    });

  } catch (error) {
    console.error('Error fetching mandi rates:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch mandi rates',
      error: error.message
    });
  }
};
