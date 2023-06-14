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
  'parse-names',
]

function getName(author: unknown): string {
  const particle = _.get(author, 'non-dropping-particle', '')
  const family = _.get(author, 'family', '')
  return particle ? `${particle} ${family}` : family
}

export type CslData = { readonly [key: string]: any }
export default class BibliographyEntry {
  readonly [immerable] = true
  private readonly cslData: CslData

  constructor(cslData?: CslData | null | undefined) {
    this.cslData = cslData
      ? produce(cslData, (draft) => {
          _.keys(draft)
            .filter((key) => key.startsWith('_'))
            .forEach(_.partial(_.unset, draft))
          if (draft.author) {
            draft.author = draft.author.map(
              _.partialRight(_.pick, authorProperties)
            )
          }
        })
      : {}
  }

  get id(): string {
    return _.get(this.cslData, 'id', '')
  }

  get primaryAuthor(): string {
    return _.head(this.authors) || ''
  }

  get authors(): string[] {
    return _.get(this.cslData, 'author', []).map(getName)
  }

  get year(): string {
    const start = _.get(this.cslData, 'issued.date-parts.0.0', '')
    const end = _.get(this.cslData, 'issued.date-parts.1.0', '')
    return end ? `${start}–${end}` : String(start)
  }

  get title(): string {
    return _.get(this.cslData, 'title', '')
  }

  get shortContainerTitle(): string {
    return _.get(this.cslData, 'container-title-short', '')
  }

  get shortTitle(): string {
    return _.get(this.cslData, 'title-short', '')
  }

  get collectionNumber(): string {
    return _.get(this.cslData, 'collection-number', '')
  }

  get volume(): string {
    return _.get(this.cslData, 'volume', '')
  }

  get link(): string {
    const url = _.get(this.cslData, 'URL', '')
    const doi = _.get(this.cslData, 'DOI', '')
    return url || (doi ? `https://doi.org/${doi}` : '')
  }

  get authorYearTitle(): string {
    return `${this.primaryAuthor} ${this.year} ${this.title}`
  }

  get abberviationContainer(): string | undefined {
    const containerTitleShort = this.shortContainerTitle
    const collectionNumber = this.collectionNumber
      ? ` ${this.collectionNumber}`
      : ''
    return containerTitleShort
      ? `${containerTitleShort}${collectionNumber}`
      : undefined
  }

  get abbreviationTitle(): string | undefined {
    const { shortTitle } = this
    const volume = this.volume ? ` ${this.volume}` : ''
    return shortTitle ? `${shortTitle}${volume}` : undefined
  }

  get abbreviations(): string | undefined {
    const { abberviationContainer, abbreviationTitle } = this
    if (abberviationContainer && abbreviationTitle) {
      return `${abberviationContainer} = ${abbreviationTitle}`
    }
    return abberviationContainer ?? abbreviationTitle ?? undefined
  }

  createLabel(): string {
    return this.abbreviations
      ? `${this.abbreviations} = ${this.authorYearTitle}`
      : this.authorYearTitle
  }

  toHtml(): string {
    return new Cite(_.cloneDeep(this.cslData)).format('bibliography', {
      format: 'html',
      template: 'citation-apa',
      lang: 'de-DE',
    })
  }

  toBibtex(): string {
    return new Cite(_.cloneDeep(this.cslData)).get({
      format: 'string',
      type: 'string',
      style: 'bibtex',
    })
  }

  toCslData(): CslData {
    return this.cslData
  }
}

export const template = new BibliographyEntry({
  id: '<id>',
  title: '<title>',
  type: '<type>',
  DOI: '<doi>',
  issued: {
    'date-parts': [['<year>']],
  },
  volume: '<volume>',
  page: '<page(s)>',
  issue: '<issue>',
  'container-title': '<journal>',
  author: [
    {
      given: '<given name>',
      family: '<family name>',
    },
  ],
})
