const yml = require("./loc.js")
const ai = require('./ai.js');
const check = require('./check.js');
const config = require('../config.json');
const c = require('ansi-colors');

async function processText(chunk) {
    try {
        const text = new yml(await ai(config.promt.join("\n").replace("{DATA}", chunk)), true);
        return " " + text.getList().join(" ");
    } catch (error) {
        console.error(c.red("❌ Process text hatası:", error));
        throw error; // Hatayı yukarı ilet
    }
}

module.exports = async function (text, checksystem = 1) {
    try {
        if (typeof text === 'string') {
            text = new yml(text);
        }

        var tempText = checksystem != 1 ? "\n" : "l_turkish:\n"

        const allItems = text.getList();
        const chunks = [[]]
        for (let i = 0; i < allItems.length; i += config.chunkSize/checksystem) {
            const chunk = allItems.slice(i, i + (config.chunkSize/checksystem)).join("")
            if (chunks[chunks.length - 1].length >= config.shard) {
                chunks.push([processText(chunk)]);
            } else chunks[chunks.length - 1].push(processText(chunk));
        }

        for (const chunk of chunks) {
            console.log(c.cyan(`📦 ${chunk.length} items in chunk`));
            try {
                const [...data] = await Promise.all(chunk)
                data.forEach(data => {
                    tempText += data
                })
            } catch (error) {
                // Eğer bir chunk işlenirken hata olursa, hata fırlatıyoruz
                console.error(c.red("❌ Chunk işlenirken hata:", error));
                throw error;
            }
        }

        if(checksystem != 1) return await check(tempText, text);
        else return tempText;
    } catch (e) {
        console.log(c.red("❌ Error in chunkProcess.js: ", e));
        throw e;
    }
}