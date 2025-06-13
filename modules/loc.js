function splitFromFirstQuote(str) {
    const firstIndex = str.indexOf('"')
    if (firstIndex === -1) return str

    const before = str.slice(0, firstIndex)
    let after = str.slice(firstIndex + 1)

    if (after.endsWith('"')) {
        after = after.slice(0, -1)
    }

    return {
        name: before.trim(),
        value: after
    }
}


class Eu4Loc {
    constructor(textdata, itsai) {
        if (itsai)
            textdata = textdata.replace("```txt", "").replace("```", "")

        this.list = []
        for (let line of textdata.split('\n')) {
            line = line.trim()
            if (!line || line.startsWith('#')) continue;

            const match = splitFromFirstQuote(line)
            if (!match.name || !match.value) continue;
            this.list.push(`${match.name} "${match.value}"\n`)
        }
    }

    getList() {
        return this.list
    }
}

module.exports = Eu4Loc