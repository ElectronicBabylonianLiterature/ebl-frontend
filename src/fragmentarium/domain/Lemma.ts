import _ from 'lodash'

function extractMeanings(object, levels: any[]) {
  return _.isEmpty(levels)
    ? [object.meaning]
    : [
        object.meaning,
        ...object[_.head(levels)].map(inner =>
          extractMeanings(inner, _.tail(levels))
        )
      ]
}

function findMeaning(word) {
  return (
    _(extractMeanings(word, ['amplifiedMeanings', 'entries']))
      .flattenDeep()
      .compact()
      .head() || ''
  )
}

function createMeaning(word) {
  const markdown = findMeaning(word)
  const truncated = _.truncate(markdown.replace(/[*\\]/g, ''), {
    separator: ' ',
    omission: '…'
  })
  return truncated ? `, ${truncated}` : ''
}

export default class Lemma {
  readonly value: string
  readonly lemma: string
  readonly homonym: string
  readonly label: string

  constructor(word: { [key: string]: any }) {
    this.value = word._id
    this.lemma = word.lemma.join(' ')
    this.homonym = word.homonym === 'I' ? '' : ` ${word.homonym}`
    this.label = `${this.lemma}${this.homonym}${createMeaning(word)}`
  }
}
