import _ from 'lodash'

function extractMeanings (object, levels) {
  return _.isEmpty(levels)
    ? [object.meaning]
    : [
      object.meaning,
      ...object[_.head(levels)].map(inner =>
        extractMeanings(inner, _.tail(levels))
      )
    ]
}

function findMeanig (word) {
  return (
    _(extractMeanings(word, ['amplifiedMeanings', 'entries']))
      .flattenDeep()
      .compact()
      .head() || ''
  )
}

function createMeaning (word) {
  const markdown = findMeanig(word)
  const truncated = _.truncate(markdown.replace(/\*|\\/g, ''), {
    separator: ' ',
    omission: '…'
  })
  return truncated ? `, ${truncated}` : ''
}

export default class Lemma {
  constructor (word) {
    this.value = word._id
    this.lemma = word.lemma.join(' ')
    this.homonym = word.homonym === 'I' ? '' : ` ${word.homonym}`
    this.label = `${this.lemma}${this.homonym}${createMeaning(word)}`
    Object.freeze(this)
  }
}
