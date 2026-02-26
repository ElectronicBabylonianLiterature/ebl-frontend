import Bluebird from 'bluebird'
import ApiClient from 'http/ApiClient'
import ReferenceInjector from 'transliteration/application/ReferenceInjector'
import BibliographyService from 'bibliography/application/BibliographyService'
import { MarkupPart } from 'transliteration/domain/markup'
import { stringify } from 'query-string'

export default class MarkupService {
  protected readonly referenceInjector: ReferenceInjector
  protected urlPath = 'markup'

  constructor(
    protected readonly apiClient: ApiClient,
    bibliographyService: BibliographyService,
  ) {
    this.referenceInjector = new ReferenceInjector(bibliographyService)
  }

  fromString(text: string): Bluebird<readonly MarkupPart[]> {
    return this.apiClient
      .fetchJson(
        `/${this.urlPath}?${stringify({
          text: text,
        })}`,
        false,
      )
      .then((parts) =>
        parts
          ? this.injectReferencesToMarkup(parts as readonly MarkupPart[])
          : ([] as readonly MarkupPart[]),
      )
  }

  toString(parts: readonly MarkupPart[]): string {
    // Important:
    // This is *not* fully implemented.
    // Used in `ChapterViewHeadTags` (corpus/ui/ChapterView.tsx).
    return parts.map((part) => part['text'] ?? '').join(' ')
  }

  injectReferencesToMarkup(
    parts: readonly MarkupPart[],
  ): Bluebird<readonly MarkupPart[]> {
    return this.referenceInjector.injectReferencesToMarkup(parts)
  }
}

export class CachedMarkupService extends MarkupService {
  protected urlPath = 'cached-markup'
}
