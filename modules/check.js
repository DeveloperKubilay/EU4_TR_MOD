const yml = require("./loc.js")
const chunkProcess = require('./chunkProcess.js');
const config = require('../config.json');
const c = require('ansi-colors');

module.exports = async function (newtext, oldtext) {
    console.log(c.cyan("🔎 Checking text for errors..."));
    if(oldtext == false) return;
    const newdb = new yml(newtext)
    const olddb = new yml(oldtext)
    var notfounddatas = []
    for (const name of olddb.getNames()) {
        if (newdb.has(name)) continue;
        notfounddatas.push(name)
    }
    if(notfounddatas.length) {
        console.log(c.yellow("⚠️ WE GOT ERR"))
        const newdata = await chunkProcess(newtext, config.FixChunk)
        newtext = newtext + newdata
        const newdb2 = new yml(newtext)
        const olddb2 = new yml(oldtext)
        var errFound = false
        for (const name2 of olddb2.getNames()) {
            if (newdb2.has(name2)) continue;
            errFound = true;
        }
        if (errFound) {
            console.error(c.bgRed.white("❌ Error: Some data not found in new text after processing:"), c.red(notfounddatas));
            return false;
        }
    }
    return newtext
}