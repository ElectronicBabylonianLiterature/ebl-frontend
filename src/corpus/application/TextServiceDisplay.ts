import Bluebird from 'bluebird'
import { produce, castDraft } from 'immer'
import _ from 'lodash'
import { stringify } from 'query-string'

import {
  ChapterDisplayDto,
  fromLineDetailsDto,
  LineVariantDisplayDto,
} from 'corpus/application/dtos'
import TextServiceCache, {
  createChapterDisplayCacheKey,
  createChapterUrl,
  preloadProvenances,
} from 'corpus/application/textServiceCore'
import { ChapterDisplay, LineVariantDisplay } from 'corpus/domain/chapter'
import { LineDetails } from 'corpus/domain/line-details'
import FragmentService from 'fragmentarium/application/FragmentService'
import ApiClient from 'http/ApiClient'
import ReferenceInjector from 'transliteration/application/ReferenceInjector'
import { fromTransliterationLineDto } from 'transliteration/application/dtos'
import { ChapterId } from 'transliteration/domain/chapter-id'
import { NoteLine, NoteLineDto } from 'transliteration/domain/note-line'
import { ParallelLine } from 'transliteration/domain/parallel-line'
import TranslationLine from 'transliteration/domain/translation-line'
import { isNoteLine } from 'transliteration/domain/type-guards'

export default class TextServiceDisplay {
  constructor(
    private readonly apiClient: ApiClient,
    private readonly fragmentService: FragmentService,
    private readonly referenceInjector: ReferenceInjector,
    private readonly cache: TextServiceCache,
  ) {}

  findChapterDisplay(
    id: ChapterId,
    lines: readonly number[],
    variants: readonly number[],
  ): Bluebird<ChapterDisplay> {
    const cacheKey = createChapterDisplayCacheKey(id, lines, variants)
    return this.cache.getChapterDisplay(cacheKey, () =>
      this.fetchChapterDisplay(id, lines, variants),
    )
  }

  findLineVariant(
    variant: LineVariantDisplayDto,
    isPrimaryVariant: boolean,
  ): Bluebird<LineVariantDisplay> {
    return Bluebird.all([
      variant.note &&
        this.referenceInjector
          .injectReferencesToMarkup(variant.note.parts)
          .then(
            (parts) =>
              new NoteLine({ ...(variant.note as NoteLineDto), parts }),
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
  ): Bluebird<LineDetails> {
    return Bluebird.all([
      preloadProvenances(this.fragmentService),
      this.apiClient.fetchJson(
        `${createChapterUrl(id)}/lines/${number}`,
        false,
      ),
    ])
      .then(([, json]) => fromLineDetailsDto(json, variantNumber))
      .then((line) =>
        Bluebird.all(
          line.variants.map((variant) =>
            Bluebird.all(
              variant.manuscripts.map((manuscript) =>
                Bluebird.all(
                  manuscript.paratext.map((line) =>
                    isNoteLine(line)
                      ? this.referenceInjector
                          .injectReferencesToMarkup(line.parts)
                          .then((parts) =>
                            produce(line, (draft) => {
                              draft.parts = castDraft(parts)
                            }),
                          )
                      : line,
                  ),
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

  private fetchChapterDisplay(
    id: ChapterId,
    lines: readonly number[],
    variants: readonly number[],
  ): Bluebird<ChapterDisplay> {
    const lineParams = _.isEmpty(lines)
      ? ''
      : `?${stringify({ lines, variants })}`
    return Bluebird.all([
      preloadProvenances(this.fragmentService),
      this.apiClient.fetchJson<ChapterDisplayDto>(
        `${createChapterUrl(id)}/display${lineParams}`,
        false,
      ),
    ]).then(([, chapter]) =>
      Bluebird.all(
        chapter.lines.map((line) =>
          Bluebird.all([
            Bluebird.all(
              line.translation.map((translation) =>
                this.referenceInjector
                  .injectReferencesToMarkup(translation.parts)
                  .then(
                    (parts) =>
                      new TranslationLine({
                        ...castDraft(translation),
                        parts,
                      }),
                  ),
              ),
            ),
            Bluebird.all(
              line.variants.map((variant, index) =>
                this.findLineVariant(variant, index === 0),
              ),
            ),
            Bluebird.all(
              line.oldLineNumbers.map((oldLineNumber) =>
                this.referenceInjector.injectReferenceToOldLineNumber(
                  oldLineNumber,
                ),
              ),
            ),
          ]).then(([translation, lineVariants, oldLineNumbers]) => ({
            ...line,
            translation,
            variants: lineVariants,
            oldLineNumbers,
          })),
        ),
      ).then(
        (chapterLines) =>
          new ChapterDisplay(
            chapter.id,
            chapter.textHasDoi,
            chapter.textName,
            chapter.isSingleStage,
            chapter.title,
            chapterLines,
            chapter.record,
            chapter.atf,
          ),
      ),
    )
  }
}
