const { GoogleGenAI } = require('@google/genai');
const ai = new GoogleGenAI({ apiKey: process.env.Gemini_API_KEY });
const model = require('../config.json').model
const c = require('ansi-colors');

const MAX_RETRIES = 3;
const RETRY_DELAY = 5000;
const REQUEST_ID = Date.now() + Math.random().toString(36).substring(2, 15);

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// İstek sayısını takip etmek için basit bir sayaç
let pendingRequests = 0;
const maxPendingRequests = 5; // Aynı anda en fazla 5 istek

module.exports = async function(data) {
  // İstek kimliği oluştur (istek takibi için)
  const requestId = `${REQUEST_ID}-${Math.random().toString(36).substring(2, 7)}`;
  
  // Çok fazla bekleyen istek varsa bekle
  while (pendingRequests >= maxPendingRequests) {
    console.log(c.yellow(`⏸️ [${requestId}] Çok fazla AI isteği var, bekleniyor... (${pendingRequests}/${maxPendingRequests})`));
    await sleep(2000);
  }
  
  pendingRequests++;
  console.log(c.green(`🔍 [${requestId}] AI ile içerik oluşturuluyor... (${pendingRequests}/${maxPendingRequests})`));
  let retries = 0;
  
  try {
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
        console.log(c.green(`✅ [${requestId}] AI isteği başarılı`));
        pendingRequests--; // İstek sayısını azalt
        return response.text.replace(/[()]/g, '');
      } catch (err) {
        retries++;
        console.error(c.red(`🚫 [${requestId}] AI Hatası (Deneme ${retries}/${MAX_RETRIES}):`, err));
        
        if (retries >= MAX_RETRIES) {
          console.error(c.bgRed.white("❌ Maksimum deneme sayısına ulaşıldı, işlem başarısız!"));
          pendingRequests--; // İstek sayısını azalt (hata durumunda da)
          throw err;
        }
        
        console.log(c.blue(`⏳ ${RETRY_DELAY/1000} saniye sonra tekrar deneniyor...`));
        await sleep(RETRY_DELAY);
      }
    }
  } catch (err) {
    // Dış try-catch ile beklenmeyen hatalar yakalanıyor
    pendingRequests--; // İstek sayısını azalt (hata durumunda da)
    throw err; // Hatayı yeniden fırlat
  }
}