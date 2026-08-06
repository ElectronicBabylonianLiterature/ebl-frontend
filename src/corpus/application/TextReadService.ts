import { produce, castDraft } from 'immer'
import _ from 'lodash'
import { stringify } from 'query-string'

import { Chapter, ChapterDisplay } from 'corpus/domain/chapter'
import { ChapterId } from 'transliteration/domain/chapter-id'

import { Text } from 'corpus/domain/text'
import { TextId } from 'transliteration/domain/text-id'
import { ChapterDisplayDto, fromChapterDto, fromDto } from './dtos'
import TranslationLine from 'transliteration/domain/translation-line'
import getOrFetchCachedValue from 'common/utils/getOrFetchCachedValue'

import { createTextUrl, createChapterUrl } from 'corpus/application/chapterUrls'
import TextServiceBase from 'corpus/application/TextServiceBase'

import {
  chapterDisplayCacheEntryLifetimeInMilliseconds,
  maximumCachedChapterDisplays,
} from 'corpus/application/textServiceConstants'

export class TextReadService extends TextServiceBase {
  find({ genre, category, index }: TextId): Promise<Text> {
    return this.apiClient
      .fetchJson<Record<string, unknown>>(
        createTextUrl(genre, category, index),
        false,
      )
      .then(fromDto)
      .then((text) =>
        Promise.all(
          text.chapters.map((chapter) =>
            this.referenceInjector
              .injectReferencesToMarkup(chapter.title)
              .then((title) => ({
                ...chapter,
                title,
              })),
          ),
        ).then((chapters) =>
          produce(text, (draft) => {
            draft.chapters = castDraft(chapters)
          }),
        ),
      )
  }

  findChapter(id: ChapterId): Promise<Chapter> {
    return Promise.all([
      this.loadProvenances(),
      this.apiClient.fetchJson<Record<string, unknown>>(
        createChapterUrl(id),
        false,
      ),
    ]).then(([, dto]) => fromChapterDto(dto))
  }

  findChapterDisplay(
    id: ChapterId,
    lines: readonly number[] = [],
    variants: readonly number[] = [],
  ): Promise<ChapterDisplay> {
    this.clearCachesWhenScopeChanges()

    const cacheKey = this.createChapterDisplayCacheKey(id, lines, variants)

    return getOrFetchCachedValue({
      cache: this.cachedChapterDisplays,
      requests: this.cachedChapterDisplayRequests,
      key: cacheKey,
      maximumCacheSize: maximumCachedChapterDisplays,
      cacheEntryLifetimeInMilliseconds:
        chapterDisplayCacheEntryLifetimeInMilliseconds,
      fetchValue: () =>
        this.chapterDisplayFetchLimiter.run(() =>
          this.fetchChapterDisplay(id, lines, variants),
        ),
    })
  }

  protected fetchChapterDisplay(
    id: ChapterId,
    lines: readonly number[] = [],
    variants: readonly number[] = [],
  ): Promise<ChapterDisplay> {
    const lineParams = _.isEmpty(lines)
      ? ''
      : `?${stringify({ lines, variants })}`
    return Promise.all([
      this.loadProvenances(),
      this.apiClient.fetchJson<ChapterDisplayDto>(
        `${createChapterUrl(id)}/display${lineParams}`,
        false,
      ),
    ]).then(([, chapter]) =>
      Promise.all(
        chapter.lines.map((line) =>
          Promise.all([
            Promise.all(
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
            Promise.all(
              line.variants.map((variant, index) =>
                this.findLineVariant(variant, index === 0),
              ),
            ),
            Promise.all(
              line.oldLineNumbers.map((oldLineNumberDto) =>
                this.referenceInjector.injectReferenceToOldLineNumber(
                  oldLineNumberDto,
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

export default TextReadService
