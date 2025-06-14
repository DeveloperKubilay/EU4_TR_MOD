const { GoogleGenAI } = require('@google/genai');
const ai = new GoogleGenAI({ apiKey: process.env.Gemini_API_KEY });
const model = require('../config.json').model

const MAX_RETRIES = 3;
const RETRY_DELAY = 5000;

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

module.exports = async function(data) {
  let retries = 0;
  
  while (retries < MAX_RETRIES) {
    try {
      const generationConfig = {
        maxOutputTokens: 8192
      };

      const response = await ai.models.generateContent({
        model: model,
        contents: [{
          text: data
        }],
        generationConfig,
        responseMimeType: 'text/plain'
      });
      return response.text.replace(/[()]/g, '');
    } catch (err) {
      retries++;
      console.error(`AI Hatası (Deneme ${retries}/${MAX_RETRIES}):`, err);
      
      if (retries >= MAX_RETRIES) {
        console.error("Maksimum deneme sayısına ulaşıldı, işlem başarısız!");
        throw err;
      }
      
      console.log(`${RETRY_DELAY/1000} saniye sonra tekrar deneniyor...`);
      await sleep(RETRY_DELAY);
    }
  }
}