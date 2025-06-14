const yml = require("./loc.js")
const ai = require('./ai.js');
const check = require('./check.js');
const config = require('../config.json');

async function processText(chunk) {
    const text = new yml(await ai(config.promt.join("\n").replace("{DATA}", chunk)), true);
    return " " + text.getList().join(" ")
}

module.exports = async function (text,checksystem = 1) {
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
        console.log(chunk.length, "items in chunk");
        const [...data] = await Promise.all(chunk)
        data.forEach(data => {
            tempText += data
        })
    }

    if(checksystem != 1) return await check(tempText,text);
    else return tempText;
}