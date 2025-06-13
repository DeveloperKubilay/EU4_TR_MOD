const { GoogleGenAI } = require('@google/genai');
const ai = new GoogleGenAI({ apiKey: process.env.Gemini_API_KEY });
const model = require('../config.json').model

module.exports = async function(data) {
  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: [{
        text: data
      }],
      responseMimeType: 'text/plain'
    });
    
    return response.text.replace(/[()]/g, '');
  } catch (err) {
    console.error("AI Error:", err);
    throw err;
  }
}