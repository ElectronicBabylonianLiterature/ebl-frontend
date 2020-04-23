import _ from 'lodash'
import Cite from 'citation-js'
import { immerable, produce } from 'immer'

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

function getName(author) {
  const particle = _.get(author, 'non-dropping-particle', '')
  const family = _.get(author, 'family', '')
  return particle ? `${particle} ${family}` : family
}

type CslData = { readonly [key: string]: any }
class BibliographyEntry {
  private readonly cslData: CslData

  constructor(cslData?: CslData | null | undefined) {
    this.cslData = cslData
      ? produce(cslData, draft => {
          _.keys(draft)
            .filter(key => key.startsWith('_'))
            .forEach(_.partial(_.unset, draft))
          if (draft.author) {
            draft.author = draft.author.map(
              _.partialRight(_.pick, authorProperties)
            )
          }
        })
      : {}
  }

  get id() {
    return _.get(this.cslData, 'id', '')
  }

  get primaryAuthor() {
    return _.head(this.authors) || ''
  }

  get authors() {
    return _.get(this.cslData, 'author', []).map(getName)
  }

  get year() {
    const start = _.get(this.cslData, 'issued.date-parts.0.0', '')
    const end = _.get(this.cslData, 'issued.date-parts.1.0', '')
    return end ? `${start}–${end}` : String(start)
  }

  get title() {
    return _.get(this.cslData, 'title', '')
  }

  get shortContainerTitle() {
    return _.get(this.cslData, 'container-title-short', '')
  }

  get collectionNumber() {
    return _.get(this.cslData, 'collection-number', '')
  }

  get link() {
    const url = _.get(this.cslData, 'URL', '')
    const doi = _.get(this.cslData, 'DOI', '')
    return url || (doi ? `https://doi.org/${doi}` : '')
  }

  toHtml() {
    return new Cite(_.cloneDeep(this.cslData)).format('bibliography', {
      format: 'html',
      template: 'citation-apa',
      lang: 'de-DE'
    })
  }

  toBibtex() {
    return new Cite(_.cloneDeep(this.cslData)).get({
      format: 'string',
      type: 'string',
      style: 'bibtex'
    })
  }

  toJson() {
    return this.cslData
  }
}
BibliographyEntry[immerable] = true
export default BibliographyEntry

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
