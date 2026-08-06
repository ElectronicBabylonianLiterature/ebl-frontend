import { produce, castDraft } from 'immer'

import BibliographyService from 'bibliography/application/BibliographyService'
import { ChapterDisplay, LineVariantDisplay } from 'corpus/domain/chapter'
import { ChapterId } from 'transliteration/domain/chapter-id'
import { LineDetails } from 'corpus/domain/line-details'

import SiglumAndTransliteration from 'corpus/domain/SiglumAndTransliteration'
import { Text } from 'corpus/domain/text'
import WordService from 'dictionary/application/WordService'
import FragmentService from 'fragmentarium/application/FragmentService'
import ApiClient from 'http/ApiClient'
import ReferenceInjector from 'transliteration/application/ReferenceInjector'
import {
  fromLineDetailsDto,
  fromSiglumAndTransliterationDto,
  LineVariantDisplayDto,
} from 'corpus/application/dtos'
import { isNoteLine } from 'transliteration/domain/type-guards'
import { NoteLine, NoteLineDto } from 'transliteration/domain/note-line'
import { fromTransliterationLineDto } from 'transliteration/application/dtos'
import { ParallelLine } from 'transliteration/domain/parallel-line'
import ConcurrencyLimiter from 'common/utils/ConcurrencyLimiter'
import { CacheEntry } from 'common/utils/cache'

import { createChapterUrl } from 'corpus/application/chapterUrls'

import {
  chapterDisplayConcurrencyLimit,
  defaultCacheScope,
} from 'corpus/application/textServiceConstants'

export class TextServiceCore {
  protected loadProvenances(): Promise<void> {
    return Promise.resolve(this.fragmentService.fetchProvenances())
      .then(() => undefined)
      .catch((error) => {
        console.error('Failed to preload provenances', error)
      })
  }
  protected readonly referenceInjector: ReferenceInjector

  protected cacheScope: string | null = null

  protected cachedTexts: Promise<Text[]> | null = null

  protected readonly cachedChapterDisplays = new Map<
    string,
    CacheEntry<ChapterDisplay>
  >()

  protected readonly cachedChapterDisplayRequests = new Map<
    string,
    Promise<ChapterDisplay>
  >()

  protected readonly chapterDisplayFetchLimiter = new ConcurrencyLimiter(
    chapterDisplayConcurrencyLimit,
  )

  constructor(
    protected readonly apiClient: ApiClient,
    protected readonly fragmentService: FragmentService,
    protected readonly wordService: WordService,
    bibliographyService: BibliographyService,
    protected readonly getCacheScope: () => string = () => defaultCacheScope,
  ) {
    this.referenceInjector = new ReferenceInjector(bibliographyService)
  }

  findLineVariant(
    variant: LineVariantDisplayDto,
    isPrimaryVariant: boolean,
  ): Promise<LineVariantDisplay> {
    return Promise.all([
      variant.note &&
        this.referenceInjector
          .injectReferencesToMarkup(variant.note.parts)
          .then(
            (parts) =>
              new NoteLine({
                ...(variant.note as NoteLineDto),
                parts,
              }),
          ),
      variant.parallelLines.map(
        (parallel) => fromTransliterationLineDto(parallel) as ParallelLine,
      ),
      this.referenceInjector.injectReferencesToMarkup(variant.intertext),
    ]).then(([note, parallelLines, intertext]) => ({
      ...variant,
      reconstruction: variant.reconstruction.map((token, index) => ({
        ...token,
        sentenceIndex: index,
      })),
      note,
      parallelLines,
      intertext,
      isPrimaryVariant,
    }))
  }

  findChapterLine(
    id: ChapterId,
    number: number,
    variantNumber: number,
  ): Promise<LineDetails> {
    return Promise.all([
      this.loadProvenances(),
      this.apiClient.fetchJson(
        `${createChapterUrl(id)}/lines/${number}`,
        false,
      ),
    ])
      .then(([, json]) => fromLineDetailsDto(json, variantNumber))
      .then((line) =>
        Promise.all(
          line.variants.map((variant) =>
            Promise.all(
              variant.manuscripts.map((manuscript) =>
                Promise.all(
                  manuscript.paratext.map((line) => {
                    if (isNoteLine(line)) {
                      return this.referenceInjector
                        .injectReferencesToMarkup(line.parts)
                        .then((parts) =>
                          produce(line, (draft) => {
                            draft.parts = castDraft(parts)
                          }),
                        )
                    } else {
                      return line
                    }
                  }),
                ).then((paratext) =>
                  produce(manuscript, (draft) => {
                    draft.paratext = castDraft(paratext)
                  }),
                ),
              ),
            ).then((manuscripts) => ({ ...variant, manuscripts })),
          ),
        ).then((variants) => new LineDetails(variants, variantNumber)),
      )
  }

  protected fetchSiglaAndTransliterations(
    id: ChapterId,
    endpoint: string,
  ): Promise<SiglumAndTransliteration[]> {
    return this.apiClient
      .fetchJson(`${createChapterUrl(id)}/${endpoint}`, false)
      .then(fromSiglumAndTransliterationDto)
      .then((entries) =>
        Promise.all(
          entries.map(({ siglum, text }) =>
            this.referenceInjector
              .injectReferencesToText(text)
              .then((injectedText) => ({
                siglum,
                text: injectedText,
              })),
          ),
        ),
      )
  }
}

export default TextServiceCore
