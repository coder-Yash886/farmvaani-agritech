const axios = require('axios');

const getWeather = async (lat, lon) => {
  try {
    const response = await axios.get(
      'https://api.openweathermap.org/data/2.5/weather',
      {
        params: {
          lat,
          lon,
          appid: process.env.OPENWEATHER_API_KEY,
          units: 'metric',
          lang: 'hi'
        }
      }
    );

    const d = response.data;

    return {
      city: d.name,
      temperature: d.main.temp,
      humidity: d.main.humidity,
      description: d.weather[0].description,
      windSpeed: d.wind.speed,
      rainfall: d.rain ? d.rain['1h'] : 0,
      feelsLike: d.main.feels_like
    };

  } catch (error) {
    throw new Error('Weather data nahi mila: ' + error.message);
  }
};

module.exports = { getWeather };