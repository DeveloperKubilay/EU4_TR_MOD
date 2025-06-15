const yml = require("./loc.js")
const ai = require('./ai.js');
const check = require('./check.js');
const config = require('../config.json');
const c = require('ansi-colors');

// Önceki çevirileri saklamak için bir önbellek kullanıyoruz
const translationCache = new Map();

async function processText(chunk) {
    // Aynı chunk'ı birden çok kez çevirmemek için önbellek kontrolü
    const cacheKey = chunk.trim();
    
    if (translationCache.has(cacheKey)) {
        console.log("💾 Önbellekten alınıyor...");
        return translationCache.get(cacheKey);
    }
    
    var temptext = "";
    try {
        console.log("🤖 İşleniyor...")
        temptext = await ai(config.promt.join("\n").replace("{DATA}", chunk))
        
        const result = " " + new yml(temptext, true).getList().join(" ");
        
        // Sonucu önbelleğe kaydedelim
        translationCache.set(cacheKey, result);
        
        return result;
    } catch (error) {
        console.log(c.red(`❌ AI işlemi hatası: ${error.message}`));
        return " "; // Hata durumunda boş değer döndür
    }
}

module.exports = async function (text, checksystem = 1) {
    try {
        if (typeof text === 'string') {
            text = new yml(text);
        }

        var tempText = checksystem != 1 ? "\n" : "l_turkish:\n";
          const allItems = text.getList();
        const chunks = [];
        let currentChunk = [];
        
        // İşlenen chunk'ları takip edelim
        const processedChunks = new Set();
        
        for (let i = 0; i < allItems.length; i += config.chunkSize/checksystem) {
            const chunk = allItems.slice(i, i + (config.chunkSize/checksystem)).join("");
            
            // Eğer bu chunk daha önce işlenmişse atlayalım
            if (processedChunks.has(chunk.trim())) {
                console.log(c.yellow(`⚠️ Tekrar eden chunk atlanıyor...`));
                continue;
            }
            
            // Bu chunk'ı işlenmiş olarak işaretleyelim
            processedChunks.add(chunk.trim());
            
            if (currentChunk.length >= config.shard) {
                chunks.push([...currentChunk]);
                currentChunk = [chunk];
            } else {
                currentChunk.push(chunk);
            }
        }
        
        if (currentChunk.length > 0) {
            chunks.push([...currentChunk]);
        }        // Her bir chunk için sırayla işlem yapalım
        for (const chunkGroup of chunks) {
            console.log(c.cyan(`📦 ${chunkGroup.length} metin parçası işlenecek`));
            
            for (const chunk of chunkGroup) {
                // Her bir chunk'ı sırayla işleyelim, böylece AI.js'in kuyruğuna düzgün yerleşir
                const result = await processText(chunk);
                tempText += result;
                
                // Konsola ilerlemeyi yazdıralım
                console.log(c.green(`✓ Chunk işlendi. (${chunkGroup.indexOf(chunk) + 1}/${chunkGroup.length})`));
            }
        }

        if(checksystem != 1) return await check(tempText, text);
        else return tempText;
    } catch (e) {
        console.log(c.red("❌ Error in chunkProcess.js: ", e));
        throw e;
    }
}