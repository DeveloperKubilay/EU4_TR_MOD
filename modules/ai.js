const { GoogleGenAI } = require('@google/genai');
const ai = new GoogleGenAI({ apiKey: process.env.Gemini_API_KEY });
const model = require('../config.json').model
const c = require('ansi-colors');

const MAX_RETRIES = 10;
const RETRY_DELAY = 5000;
const awaits = [];

setInterval(() => {
  if (awaits.length > 0) {
    const { data, resolve, reject } = awaits.shift();
    generateText(data, resolve, reject);
  }
}, config.AI_INT)

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

module.exports = async function (data) {
  console.log(c.green("🔍 AI ile içerik oluşturuluyor..."));
  return await new Promise((res, reject) => {
    awaits.push({ data, resolve: res, reject });
  });
}


async function generateText(data, resolve, reject) { 
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
        resolve(response.text.replace(/[()]/g, ''));
      } catch (err) {
        retries++;
        console.error(c.red(`🚫 AI Hatası (Deneme ${retries}/${MAX_RETRIES}):`, err));

        if (retries >= MAX_RETRIES) {
          console.error(c.bgRed.white("❌ Maksimum deneme sayısına ulaşıldı, işlem başarısız!"));
          reject(err);
        }

        console.log(c.blue(`⏳ ${RETRY_DELAY / 1000} saniye sonra tekrar deneniyor...`));
        await sleep(RETRY_DELAY);
      }
    }
}