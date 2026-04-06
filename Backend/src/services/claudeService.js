const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const getAdvisory = async (crop, weather, question, imageBase64) => {
  try {
    const modelName = 'gemini-2.0-flash';
    const model = genAI.getGenerativeModel({ model: modelName });

    let messageContent = `
Tu ek expert Indian farm advisor hai. 
Farmer ki baat Hindi mein sun aur simple Hindi mein jawab de.

Farmer ki location ka mausam:
- Temperature: ${weather.temperature}°C
- Humidity: ${weather.humidity}%
- Mausam: ${weather.description}
- Hawa: ${weather.windSpeed} km/h

Farmer ki fasal: ${crop}
Farmer ka sawaal: ${question}

Simple aur practical advice de Hindi mein. 3-4 lines mein jawab de.
    `;

    let result;
    if (imageBase64) {
      let base64Data = imageBase64;
      let mimeType = 'image/jpeg';

      if (imageBase64.includes(',')) {
        base64Data = imageBase64.split(',')[1];
      }
      if (imageBase64.startsWith('data:')) {
        mimeType = imageBase64.split(';')[0].split(':')[1];
      }
      
      const imageParts = [
        {
          inlineData: {
            data: base64Data,
            mimeType
          }
        }
      ];
      
      result = await model.generateContent([messageContent, ...imageParts]);
    } else {
      result = await model.generateContent(messageContent);
    }

    return result.response.text();

  } catch (error) {
    throw new Error('Advisory nahi mili: ' + error.message);
  }
};

module.exports = { getAdvisory };