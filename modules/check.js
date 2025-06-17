const yml = require("./loc.js")
const chunkProcess = require('./chunkProcess.js');
const config = require('../config.json');
const c = require('ansi-colors');

module.exports = async function (newtext, oldtext) {
    console.log(c.cyan("🔎 Checking text for errors..."));
    if(!oldtext || oldtext === false) return newtext;
    
    try {
        const newdb = new yml(newtext)
        const olddb = new yml(oldtext)
        var notfounddatas = []
        
        if (!olddb.getNames || typeof olddb.getNames !== 'function') {
            console.error(c.red("❌ olddb.getNames is not a function! oldtext type:", typeof oldtext));
            return newtext;
        }
        
        for (const name of olddb.getNames()) {
            if (newdb.has(name)) continue;
            notfounddatas.push(name)
        }
        
        if(notfounddatas.length) {
            console.log(c.yellow("⚠️ WE GOT ERR"));
            try {
                const newdata = await chunkProcess(newtext, config.FixChunk);
                
                // newdata kontrolü
                if (newdata) {
                    newtext = newtext + newdata;
                    const newdb2 = new yml(newtext);
                    const olddb2 = new yml(oldtext);
                    
                    var errFound = false;
                    for (const name2 of olddb2.getNames()) {
                        if (newdb2.has(name2)) continue;
                        errFound = true;
                    }
                    
                    if (errFound) {
                        console.error(c.bgRed.white("❌ Error: Some data not found in new text after processing:"), c.red(notfounddatas));
                        return false;
                    }
                } else {
                    console.warn(c.yellow("⚠️ chunkProcess returned no data, continuing with original text"));
                }
            } catch (error) {
                console.error(c.red(`❌ Error in check.js fixing process: ${error.message}`));
            }
        }
        return newtext;
    } catch (error) {
        console.error(c.red(`❌ Error in check.js: ${error.message}`));
        return newtext; // Hata durumunda orijinal metni döndür
    }
}