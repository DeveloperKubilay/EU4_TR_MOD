const yml = require("./loc.js")
const ai = require('./ai.js');
const check = require('./check.js');
const config = require('../config.json');
const c = require('ansi-colors');

const translationCache = new Map();

async function processText(chunk) {
    // Chunk kontrolü
    if (!chunk || typeof chunk !== 'string') {
        console.log(c.red(`❌ Geçersiz chunk verisi: ${typeof chunk}`));
        return " ";
    }
    
    const cacheKey = chunk.trim();
    
    if (translationCache.has(cacheKey)) {
        console.log("💾 Önbellekten alınıyor...");
        return translationCache.get(cacheKey);
    }
    
    var temptext = "";
    try {
        if (!config.promt || !Array.isArray(config.promt)) {
            console.log(c.red(`❌ Geçersiz config.promt: ${typeof config.promt}`));
            return " ";
        }
        
        temptext = await ai(config.promt.join("\n").replace("{DATA}", chunk))
        
        if (!temptext || typeof temptext !== 'string') {
            console.log(c.red(`❌ AI yanıtı geçersiz: ${typeof temptext}`));
            return " ";
        }
        
        try {
            const ymlObj = new yml(temptext, true);
            const list = ymlObj.getList();
            const result = " " + (Array.isArray(list) ? list.join(" ") : "");
            
            // Sonucu önbelleğe kaydedelim
            translationCache.set(cacheKey, result);
            
            return result;
        } catch (ymlError) {
            console.log(c.red(`❌ YML işleme hatası: ${ymlError.message}`));
            return " ";
        }
    } catch (error) {
        console.log(c.red(`❌ AI işlemi hatası: ${error.message}`));
        return " ";
    }
}

module.exports = async function (text, checksystem = 1) {
    try {
        if (typeof text === 'string') {
            text = new yml(text);
        }

        // Başlangıç metin kısmı her zaman l_turkish: ile başlamalı
        var tempText = checksystem != 1 ? "\n" : "l_turkish:\n";
        const allItems = text.getList();
        const chunks = [];
        let currentChunk = [];
        
        const processedChunks = new Set();
        
        for (let i = 0; i < allItems.length; i += config.chunkSize/checksystem) {
            const chunk = allItems.slice(i, i + (config.chunkSize/checksystem)).join("");
            
            if (processedChunks.has(chunk.trim())) {
                console.log(c.yellow(`⚠️ Tekrar eden chunk atlanıyor...`));
                continue;
            }
            
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
        }

        for (const chunkGroup of chunks) {
            console.log(c.cyan(`🚀 ${chunkGroup.length} metin parçası paralel işlenecek`));
            
            const promises = chunkGroup.map(chunk => processText(chunk));
            const results = await Promise.all(promises);
            
            results.forEach((result, index) => {
                tempText += result;
                console.log(c.green(`✓ Chunk işlendi. (${index + 1}/${chunkGroup.length})`));
            });
        }

        if(checksystem != 1) return await check(tempText, text);
        else return tempText;
    } catch (e) {
        console.log(c.red("❌ Error in chunkProcess.js: ", e));
        throw e;
    }
}