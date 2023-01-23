import Bluebird from 'bluebird'
import ApiClient from 'http/ApiClient'
import ReferenceInjector from 'transliteration/application/ReferenceInjector'
import BibliographyService from 'bibliography/application/BibliographyService'
import { MarkupPart } from 'transliteration/domain/markup'
import { stringify } from 'query-string'

export default class MarkupService {
  private readonly referenceInjector: ReferenceInjector
  constructor(
    private readonly apiClient: ApiClient,
    bibliographyService: BibliographyService
  ) {
    this.referenceInjector = new ReferenceInjector(bibliographyService)
  }

  fromString(text: string): Bluebird<readonly MarkupPart[]> {
    return this.apiClient
      .fetchJson(
        `/markup?${stringify({
          text: text,
        })}`,
        false
      )
      .then((parts) => {
        return Bluebird.all(
          parts && Bluebird.all(this.injectReferencesToMarkup(parts))
        )
      })
  }

  injectReferencesToMarkup(
    parts: readonly MarkupPart[]
  ): Bluebird<readonly MarkupPart[]> {
    return this.referenceInjector.injectReferencesToMarkup(parts)
  }
}
