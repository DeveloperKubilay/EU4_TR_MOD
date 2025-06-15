const { GoogleGenAI } = require('@google/genai');
require('dotenv').config({ path: '../.env' });
const ai = new GoogleGenAI({ apiKey: process.env.Gemini_API_KEY });
const Alternative_ai = new GoogleGenAI({ apiKey: process.env.Gemini_API_KEY_3 });
const FixeerAi = new GoogleGenAI({ apiKey: process.env.Gemini_API_KEY_2 });

async function tryAi(data, x) {
    try {
        const response = await data.models.generateContent({
            model: "gemini-2.5-flash-preview-05-20",
            contents: [{
                text: "selam, ben bir yapay zeka asistanıyım. Size nasıl yardımcı olabilirim?"
            }],
            generationConfig: {
                maxOutputTokens: 8192
            },
            responseMimeType: 'text/plain'
        });
        console.log(response.text, x);
    } catch (error) {
        console.error(`AI ${x} hatası:`, error.message);
        if (error.code === 'GENAI_API_ERROR') {
            console.error('API hatası, lütfen API anahtarınızı kontrol edin.');
        } else if (error.code === 'GENAI_RATE_LIMIT_EXCEEDED') {
            console.error('Rate limit aşıldı, lütfen daha sonra tekrar deneyin.');
        } else {
            console.error('Bilinmeyen hata:', error);
        }
    }
}
tryAi(ai, 1);
tryAi(Alternative_ai, 2);
tryAi(FixeerAi, 3);