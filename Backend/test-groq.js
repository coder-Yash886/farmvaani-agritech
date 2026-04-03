require('dotenv').config();
const Groq = require('groq-sdk');
const client = new Groq({ apiKey: process.env.GROQ_API_KEY });
async function run() {
  try {
    const base64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';
    const response = await client.chat.completions.create({
      model: 'llama-3.2-11b-vision',
      messages: [
        {
          role: 'user',
          content: [
            { type: "text", text: "What is this?" },
            { type: "image_url", image_url: { url: base64 } }
          ]
        }
      ],
      max_tokens: 50
    });
    console.log("Success:", response.choices[0].message.content);
  } catch (err) {
    console.error("Error:", err.message);
    if(err.response) console.error(err.response.data);
  }
}
run();
