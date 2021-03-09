import _ from 'lodash'
import BibliographyEntry from 'bibliography/domain/BibliographyEntry'

export default function createAuthorRegExp(entry: BibliographyEntry): RegExp {
  return new RegExp(_.escapeRegExp(entry.primaryAuthor.replace(/'/g, '’')))
}
