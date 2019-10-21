import _ from 'lodash'

function parseSide(side: string) {
  const match = /(\d+)([^\d]*)/.exec(side) || ['0', '']
  return {
    rows: Number(match[1]),
    suffix: match[2]
  }
}
function createTemplate({ rows, suffix = '' }: { rows: number, suffix: string}) {
  return _.range(1, rows + 1)
    .map(row => `${row}${suffix}. [...]  [...]`)
    .join('\n')
}

class Template {
  readonly pattern: string

  constructor(pattern) {
    this.pattern = pattern
  }

  get isEmpty() {
    return this.pattern === ''
  }

  get isValid() {
    return /^\d+[^,]*(?:,\s*\d+[^,]*)?$/.test(this.pattern)
  }

  generate() {
    const [obverse, reverse] = this.pattern
      .split(/,\s*/)
      .map(parseSide)
      .map(createTemplate)

    return reverse ? `@obverse\n${obverse}\n\n@reverse\n${reverse}` : obverse
  }
}

export default Template
