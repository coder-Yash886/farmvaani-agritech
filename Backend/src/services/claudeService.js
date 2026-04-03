const Groq = require('groq-sdk');

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

const getAdvisory = async (crop, weather, question, imageBase64) => {
  try {
    let modelName = 'llama-3.3-70b-versatile';
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

    // If an image is provided, construct a multi-modal message
    if (imageBase64) {
      modelName = 'llama-3.2-11b-vision-preview'; // Groq Vision model
      messageContent = [
        { type: "text", text: messageContent },
        { type: "image_url", image_url: { url: imageBase64 } }
      ];
    }

    const response = await client.chat.completions.create({
      model: modelName,
      messages: [
        {
          role: 'user',
          content: messageContent
        }
      ],
      max_tokens: 500
    });

    return response.choices[0].message.content;

  } catch (error) {
    throw new Error('Advisory nahi mili: ' + error.message);
  }
};

module.exports = { getAdvisory };