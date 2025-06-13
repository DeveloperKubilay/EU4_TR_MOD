function splitFromFirstQuote(str) {
  const firstIndex = str.indexOf('"')
  if (firstIndex === -1) return str

  const before = str.slice(0, firstIndex)
  let after = str.slice(firstIndex + 1)

  if (after.endsWith('"')) {
    after = after.slice(0, -1)
  }

  return {
    name:before.trim(),
    value:after
  }
}


class Eu4Loc {
    constructor(textdata) {
        this.data = {}
        this.list = []
        for (let line of textdata.split('\n')) {
            line = line.trim()
            if (!line || line.startsWith('#')) continue;

            const match = splitFromFirstQuote(line)
            if (!match.name || !match.value) continue;
            this.data[match.name] = match.value
            this.list.push(match.name)
        }
    }

    get(key) {
        return this.data[key]
    }

    set(key, value) {
        this.data[key] = value
    }
    getList() {
        return this.list
    }

    toString() {
        let result = 'l_turkish:'
        for (const [key, value] of Object.entries(this.data)) {
            result += ` ${key} "${value}"\n`
        }
        return result
    }
}

module.exports = Eu4Loc