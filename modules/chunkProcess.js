const yml = require("./loc.js")
const ai = require('./ai.js');
const check = require('./check.js');
const config = require('../config.json');
const c = require('ansi-colors');

// İstekler arasında gecikme sağlayan yardımcı fonksiyon
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function processText(chunk) {
    const text = new yml(await ai(config.promt.join("\n").replace("{DATA}", chunk)), true);
    return " " + text.getList().join(" ")
}

module.exports = async function (text, checksystem = 1) {
    try {
        if (typeof text === 'string') {
            text = new yml(text);
        }

        var tempText = checksystem != 1 ? "\n" : "l_turkish:\n"

        const allItems = text.getList();
        const chunks = []
        
        // Shard sayısına göre gerçek chunk'ları oluştur
        for (let i = 0; i < config.shard; i++) {
            chunks.push([]);
        }
        
        // Metin parçalarını shard'lara dağıt
        let currentShardIndex = 0;
        for (let i = 0; i < allItems.length; i += config.chunkSize/checksystem) {
            const chunk = allItems.slice(i, i + (config.chunkSize/checksystem)).join("")
            chunks[currentShardIndex].push(chunk);
            // Sonraki shard'a geç (dönüşümlü olarak)
            currentShardIndex = (currentShardIndex + 1) % config.shard;
        }
        
        // Her bir shard'ı sırayla işle
        for (let i = 0; i < chunks.length; i++) {
            const shardChunks = chunks[i];
            if (shardChunks.length === 0) continue;
            
            console.log(c.cyan(`📦 Shard ${i+1}/${chunks.length}, ${shardChunks.length} items in shard`));
            
            // Her bir shard içindeki chunk'ları sırayla işle
            const shardResults = [];
            for (let j = 0; j < shardChunks.length; j++) {
                const result = await processText(shardChunks[j]);
                shardResults.push(result);
                // İstekler arasında kısa bir gecikme ekle
                if (j < shardChunks.length - 1) {
                    await sleep(500); // 500ms gecikme
                }
            }
            
            // Shard sonuçlarını metne ekle
            shardResults.forEach(data => {
                tempText += data;
            });
        }

        if(checksystem != 1) return await check(tempText, text);
        else return tempText;
    } catch (e) {
        console.log(c.red("❌ Error in chunkProcess.js: ", e));
        throw e;
    }
}