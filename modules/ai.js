const { GoogleGenAI } = require('@google/genai');
const ai = new GoogleGenAI({ apiKey: process.env.Gemini_API_KEY });
const model = require('../config.json').model
const c = require('ansi-colors');

const MAX_RETRIES = 3;
const RETRY_DELAY = 5000;
const RATE_LIMIT_RETRY_DELAY = 60000; // Rate limit hatası için 1 dakika bekleme

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
      
      // Rate limit hatasını kontrol et (429)
      const isRateLimit = err?.message?.includes('429') || 
                          err?.message?.includes('Too Many Requests') ||
                          err?.message?.includes('RESOURCE_EXHAUSTED');
      
      // Hata mesajından beklenecek süreyi çıkarma denemesi
      let waitTime = RETRY_DELAY;
      if (isRateLimit) {
        // Hatadan retry delay bilgisini çıkarmaya çalış
        const retryDelayMatch = err?.message?.match(/retryDelay":"(\d+)s"/);
        if (retryDelayMatch && retryDelayMatch[1]) {
          waitTime = parseInt(retryDelayMatch[1]) * 1000 + 5000; // Saniyeyi milisaniyeye çevir ve biraz ekstra süre ekle
        } else {
          waitTime = RATE_LIMIT_RETRY_DELAY; // Varsayılan rate limit bekleme süresi
        }
        
        console.error(c.red(`🔒 Rate limit hatası alındı (Deneme ${retries}/${MAX_RETRIES}), ${waitTime/1000} saniye bekleniyor...`));
      } else {
        console.error(c.red(`🚫 AI Hatası (Deneme ${retries}/${MAX_RETRIES}):`, err));
      }
      
      if (retries >= MAX_RETRIES) {
        console.error(c.bgRed.white("❌ Maksimum deneme sayısına ulaşıldı, işlem başarısız!"));
        throw err;
      }
      
      if (!isRateLimit) {
        console.log(c.blue(`⏳ ${waitTime/1000} saniye sonra tekrar deneniyor...`));
      }
      
      await sleep(waitTime);
    }
  }
}