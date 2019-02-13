import _ from 'lodash'
import Cite from 'citation-js'

export default class BibliographyEntry {
  #cslData

  constructor (cslData) {
    this.cslData = _.cloneDeep(cslData)
    Object.freeze(this)
  }

  get id () {
    return _.get(this.cslData, 'id', '')
  }

  get author () {
    const particle = _.get(this.cslData, 'author.0.non-dropping-particle', '')
    const family = _.get(this.cslData, 'author.0.family', '')
    return particle
      ? `${particle} ${family}`
      : family
  }

  get year () {
    const start = _.get(this.cslData, 'issued.date-parts.0.0', '')
    const end = _.get(this.cslData, 'issued.date-parts.1.0', '')
    return end
      ? `${start}–${end}`
      : String(start)
  }

  get title () {
    return _.get(this.cslData, 'title', '')
  }

  get link () {
    const url = this.cslData.URL
    const doi = this.cslData.DOI
    return url || (doi
      ? `https://doi.org/${doi}`
      : '')
  }

  toHtml () {
    return new Cite(this.cslData).format('bibliography', {
      format: 'html',
      template: 'citation-apa',
      lang: 'de-DE'
    })
  }

  toBibtex () {
    return new Cite(this.cslData).get({
      format: 'string',
      type: 'string',
      style: 'bibtex'
    })
  }

  toJson () {
    return _.cloneDeep(this.cslData)
  }
}
