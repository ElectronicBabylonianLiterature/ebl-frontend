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
          // Remove properties starting with '_'
          Object.keys(draft)
            .filter((key) => key.startsWith('_'))
            .forEach((key) => delete draft[key])

          // Normalize author data
          if (draft.author) {
            draft.author = draft.author.map((author) =>
              _.pick(author, authorProperties)
            )
          }
        })
      : {}
  }

  get id(): string {
    return this.cslData.id || ''
  }

  get primaryAuthor(): string {
    return this.authors[0] || ''
  }

  get authors(): string[] {
    return (this.cslData.author || []).map(getName)
  }

  get year(): string {
    const dates = _.get(this.cslData, 'issued.date-parts', [])
    const start = dates[0]?.[0] || ''
    const end = dates[1]?.[0] || ''
    return end ? `${start}–${end}` : String(start)
  }

  get title(): string {
    return this.cslData.title || ''
  }

  get shortContainerTitle(): string {
    return this.cslData['container-title-short'] || ''
  }

  get shortTitle(): string {
    return this.cslData['title-short'] || ''
  }

  get collectionNumber(): string {
    return this.cslData['collection-number'] || ''
  }

  get volume(): string {
    return this.cslData.volume || ''
  }

  get link(): string {
    return (
      this.cslData.URL ||
      (this.cslData.DOI ? `https://doi.org/${this.cslData.DOI}` : '')
    )
  }

  get authorYearTitle(): string {
    return `${this.primaryAuthor} ${this.year} ${this.title}`
  }

  get abbreviationContainer(): string | undefined {
    const container = this.shortContainerTitle
    const number = this.collectionNumber ? ` ${this.collectionNumber}` : ''
    return container ? `${container}${number}` : undefined
  }

  get abbreviationTitle(): string | undefined {
    const title = this.shortTitle
    const vol = this.volume ? ` ${this.volume}` : ''
    return title ? `${title}${vol}` : undefined
  }

  get abbreviations(): string | undefined {
    const container = this.abbreviationContainer
    const title = this.abbreviationTitle
    if (container && title) return `${container} = ${title}`
    return container || title
  }

  get label(): string {
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
