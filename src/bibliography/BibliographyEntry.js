import _ from 'lodash'
import Cite from 'citation-js'
import { immerable, produce } from 'immer'

export default class BibliographyEntry {
  #cslData

  constructor (cslData) {
    this.#cslData = _.cloneDeep(cslData)
    this[immerable] = true
    Object.freeze(this)
  }

  get id () {
    return _.get(this.#cslData, 'id', '')
  }

  get author () {
    const particle = _.get(this.#cslData, 'author.0.non-dropping-particle', '')
    const family = _.get(this.#cslData, 'author.0.family', '')
    return particle ? `${particle} ${family}` : family
  }

  get year () {
    const start = _.get(this.#cslData, 'issued.date-parts.0.0', '')
    const end = _.get(this.#cslData, 'issued.date-parts.1.0', '')
    return end ? `${start}–${end}` : String(start)
  }

  get title () {
    return _.get(this.#cslData, 'title', '')
  }

  get link () {
    const url = this.#cslData.URL
    const doi = this.#cslData.DOI
    return url || (doi ? `https://doi.org/${doi}` : '')
  }

  toHtml () {
    return new Cite(this.#cslData).format('bibliography', {
      format: 'html',
      template: 'citation-apa',
      lang: 'de-DE'
    })
  }

  toBibtex () {
    return new Cite(this.#cslData).get({
      format: 'string',
      type: 'string',
      style: 'bibtex'
    })
  }

  toJson () {
    const authorProperties = [
      'family',
      'given',
      'dropping-particle',
      'non-dropping-particle',
      'suffix',
      'comma-suffix',
      'static-ordering',
      'literal',
      'parse-names'
    ]

    return produce(this.#cslData, draft => {
      _.keys(draft)
        .filter(key => key.startsWith('_'))
        .forEach(_.partial(_.unset, draft))
      if (draft.author) {
        draft.author = draft.author.map(
          _.partialRight(_.pick, authorProperties)
        )
      }
    })
  }
}

export const template = new BibliographyEntry({
  id: '<id>',
  title: '<title>',
  type: '<type>',
  DOI: '<doi>',
  issued: {
    'date-parts': [['<year>']]
  },
  volume: '<volume>',
  page: '<page(s)>',
  issue: '<issue>',
  'container-title': '<journal>',
  author: [
    {
      given: '<given name>',
      family: '<family name>'
    }
  ]
})
