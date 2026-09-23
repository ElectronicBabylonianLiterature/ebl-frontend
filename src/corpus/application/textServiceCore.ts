import Bluebird from 'bluebird'
import { stringify } from 'query-string'

import { CacheEntry } from 'common/utils/cache'
import ConcurrencyLimiter from 'common/utils/ConcurrencyLimiter'
import getOrFetchCachedValue from 'common/utils/getOrFetchCachedValue'
import { ChapterDisplay } from 'corpus/domain/chapter'
import { Text } from 'corpus/domain/text'
import FragmentService from 'fragmentarium/application/FragmentService'
import { ChapterId } from 'transliteration/domain/chapter-id'

const chapterDisplayCacheEntryLifetimeInMilliseconds = 2 * 60 * 1000
const maximumCachedChapterDisplays = 250
const chapterDisplayConcurrencyLimit = 4
export const defaultCacheScope = 'default'

export function createTextUrl(
  genre: string,
  category: string | number,
  index: string | number,
): string {
  return `/texts/${encodeURIComponent(genre)}/${encodeURIComponent(
    category,
  )}/${encodeURIComponent(index)}`
}

export function createChapterUrl({
  textId: { genre, category, index },
  stage,
  name,
}: ChapterId): string {
  return `${createTextUrl(
    genre,
    category,
    index,
  )}/chapters/${encodeURIComponent(stage)}/${encodeURIComponent(name)}`
}

export function createChapterDisplayCacheKey(
  id: ChapterId,
  lines: readonly number[],
  variants: readonly number[],
): string {
  return `${createChapterUrl(id)}?${stringify({ lines, variants })}`
}

export function preloadProvenances(
  fragmentService: FragmentService,
): Bluebird<void> {
  return Bluebird.resolve(fragmentService.fetchProvenances()).then(
    () => undefined,
  )
}

export default class TextServiceCache {
  private cacheScope: string | null = null
  private cachedTexts: Bluebird<Text[]> | null = null
  private readonly cachedChapterDisplays = new Map<
    string,
    CacheEntry<ChapterDisplay>
  >()
  private readonly cachedChapterDisplayRequests = new Map<
    string,
    Bluebird<ChapterDisplay>
  >()
  private readonly chapterDisplayFetchLimiter = new ConcurrencyLimiter(
    chapterDisplayConcurrencyLimit,
  )

  constructor(private readonly getCacheScope: () => string) {}

  getTexts(fetchValue: () => Bluebird<Text[]>): Bluebird<Text[]> {
    this.clearWhenScopeChanges()
    if (!this.cachedTexts) {
      this.cachedTexts = fetchValue().catch((error) => {
        this.cachedTexts = null
        throw error
      })
    }
    return this.cachedTexts
  }

  getChapterDisplay(
    key: string,
    fetchValue: () => Bluebird<ChapterDisplay>,
  ): Bluebird<ChapterDisplay> {
    this.clearWhenScopeChanges()
    return getOrFetchCachedValue({
      cache: this.cachedChapterDisplays,
      requests: this.cachedChapterDisplayRequests,
      key,
      maximumCacheSize: maximumCachedChapterDisplays,
      cacheEntryLifetimeInMilliseconds:
        chapterDisplayCacheEntryLifetimeInMilliseconds,
      fetchValue: () => this.chapterDisplayFetchLimiter.run(fetchValue),
    })
  }

  clearWhenScopeChanges(): void {
    const nextScope = this.resolveCacheScope()
    if (this.cacheScope === null) {
      this.cacheScope = nextScope
    } else if (this.cacheScope !== nextScope) {
      this.cacheScope = nextScope
      this.cachedTexts = null
      this.cachedChapterDisplays.clear()
      this.cachedChapterDisplayRequests.clear()
    }
  }

  private resolveCacheScope(): string {
    try {
      return this.getCacheScope()
    } catch {
      return defaultCacheScope
    }
  }
}
