const { GoogleGenAI } = require('@google/genai');
const ai = new GoogleGenAI({ apiKey: process.env.Gemini_API_KEY });
const Alternative_ai = new GoogleGenAI({ apiKey: process.env.Gemini_API_KEY_3 });
const FixeerAi = new GoogleGenAI({ apiKey: process.env.Gemini_API_KEY_2 });
const config = require('../config.json')
const c = require('ansi-colors');

const awaits = [];
var errscount = {};
var datenw = Date.now();
setInterval(() => {
  datenw = Date.now();
}, 1000)

setInterval(() => {
  if (Object.keys(errscount).length > 0) {
    console.log(c.yellow("⚠️ Bazı yapay zeka hataları nedeniyle bekleyen işlemler var!"));
    for (const key in errscount) {
      const { data, resolve, reject, starttime } = errscount[key];
      delete errscount[key];
      generateText(FixeerAi, starttime, data, resolve, reject,1);
    }
  }
  else if (Object.keys(errscount).length === 0 && awaits.length > 0) {
    const { data, resolve, reject } = awaits.shift();
    generateText(datenw, data, resolve, reject);
  }
}, config.AI_INT)

module.exports = async function (data) {
  return await new Promise((res, reject) => {
    awaits.push({ data, resolve: res, reject });
  });
}

var lastai = true;
function giveAi() {
  lastai = !lastai;
  if (lastai) return ai;
  return Alternative_ai;
}


async function generateText(starttime, data, resolve, reject, xv) {
  try {
    console.log(c.green(`🔍 ${xv ? "Hatayı düzeltiliyor" : "AI ile içerik oluşturuluyor"} ...`+
    `${xv ? Object.keys(errscount).length : awaits.length} kadar bekleyen var`));
    const generationConfig = {
      maxOutputTokens: 8192
    };

    const response = await (xv ? FixeerAi : giveAi()).models.generateContent({
      model: config.model,
      contents: [{
        text: data
      }],
      generationConfig,
      responseMimeType: 'text/plain'
    });
    const size = Math.floor(response.text.length / 1024)
    console.log(c.green(`✅ AI içeriği başarıyla oluşturuldu! ${(Date.now() - starttime) / 1000}s ${size} KB`));
    resolve(response.text.replace(/[()]/g, ''));
  } catch (err) {
    console.error(c.red(`❌ AI içeriği oluşturulamadı!`));
    if(!xv) {
      const dataLength = data.length;
      if (dataLength > config.FixChunk) {
        console.log(c.yellow(`⚠️ İçerik çok büyük! ${config.FixChunk} parçaya bölünüyor...`));
        const chunkSize = Math.ceil(dataLength / config.FixChunk);
        const chunks = [];
        
        for (let i = 0; i < config.FixChunk; i++) {
          const start = i * chunkSize;
          const end = Math.min(start + chunkSize, dataLength);
          chunks.push(data.substring(start, end));
        }
        
        Promise.all(chunks.map(chunk => {
          return new Promise((chunkResolve) => {
            errscount[Date.now()] = {
              data: chunk,
              resolve: chunkResolve,
              reject,
              starttime: Date.now()
            };
          });
        }))
        .then(results => {
          const combinedResult = results.join('');
          resolve(combinedResult);
        })
        .catch(error => {
          reject(error);
        });
      } else {
        errscount[starttime] = {
          data, resolve, reject, starttime
        };
      }
    } else {
      if(typeof reject === 'function') {
        reject(err);
      } else {
        console.error(c.red(`⛔ Hata işleme fonksiyonu çalıştırılamadı!`));
      }
    }
  }
}