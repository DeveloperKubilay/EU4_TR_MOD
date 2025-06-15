const { GoogleGenAI } = require('@google/genai');
const ai = new GoogleGenAI({ apiKey: process.env.Gemini_API_KEY });
const config = require('../config.json')
const c = require('ansi-colors');

const MAX_RETRIES = 10;
const RETRY_DELAY = 5000;
const awaits = [];
var wegoterr = false;

setInterval(() => {
  console.log("debug",!wegoterr,!wegoterr && awaits.length > 0)
  if (!wegoterr && awaits.length > 0) {
    const { data, resolve, reject } = awaits.shift();
    generateText(data, resolve, reject);
  }
}, config.AI_INT)

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

module.exports = async function (data) {
  return await new Promise((res, reject) => {
    awaits.push({ data, resolve: res, reject });
  });
}



async function generateText(data, resolve, reject) {
  let retries = 0;
  let igoterr = false;

  async function Asyncsleep(){
    igoterr = false;
    await sleep(RETRY_DELAY);
    if(igoterr) console.log(c.yellow("⏳ Ai hala hatayı çözemedi, bekleniyor..."));
    else {
      console.log(c.green("✅ AI hatası çözüldü, işlem devam ediyor..."));
      wegoterr = false;
    }
  }

  while (retries < MAX_RETRIES) {
    try {
      console.log(c.green(`🔍 AI ile içerik oluşturuluyor... ${awaits.length} kadar bekleyen var`));
      const generationConfig = {
        maxOutputTokens: 8192
      };

      if(igoterr) Asyncsleep();
      const response = await ai.models.generateContent({
        model: config.model,
        contents: [{
          text: data
        }],
        generationConfig,
        responseMimeType: 'text/plain'
      });
      console.log(c.green(`✅ AI içeriği başarıyla oluşturuldu! ${Math.floor(response.text.length/1024)} KB`));
      resolve(response.text.replace(/[()]/g, ''));
    } catch (err) {
      retries++;
      wegoterr = true;
      igoterr = true;
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