import { useEffect, useRef, useState } from 'react'
import TextService from 'corpus/application/TextService'
import { ChapterDisplay } from 'corpus/domain/chapter'
import { ChapterId } from 'transliteration/domain/chapter-id'
import {
  CORPUS_MATCH_BATCH_SIZE,
  CorpusMatchPair,
  corpusMatchPairKey,
  mergeChapterDisplays,
} from 'corpus/ui/search/CorpusMatchPairs'

interface ChapterMatchState {
  chapter: ChapterDisplay
  loadedPairs: number
  expanded: boolean
  loading: boolean
  error: boolean
  unavailable: boolean
  remaining: number
  nextBatchSize: number
  showMore: () => void
  collapse: () => void
}

function containsRequestedPairs(
  additional: ChapterDisplay,
  requested: readonly CorpusMatchPair[],
): boolean {
  const returnedPairs = new Set(
    additional.lines.flatMap((line) =>
      line.variants.map((variant) =>
        corpusMatchPairKey({
          line: line.originalIndex,
          variant: variant.originalIndex,
        }),
      ),
    ),
  )
  return requested.every((pair) => returnedPairs.has(corpusMatchPairKey(pair)))
}

export default function useCorpusChapterMatches(
  initialChapter: ChapterDisplay,
  chapterId: ChapterId,
  pairs: readonly CorpusMatchPair[],
  initiallyVisible: number,
  textService: TextService,
): ChapterMatchState {
  const requestVersion = useRef(0)
  const [chapter, setChapter] = useState(initialChapter)
  const [loadedPairs, setLoadedPairs] = useState(initiallyVisible)
  const [expanded, setExpanded] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [unavailable, setUnavailable] = useState(false)

  useEffect(
    () => () => {
      requestVersion.current += 1
    },
    [],
  )

  const remaining = Math.max(pairs.length - loadedPairs, 0)
  const nextBatch = pairs.slice(
    loadedPairs,
    loadedPairs + CORPUS_MATCH_BATCH_SIZE,
  )

  function collapse(): void {
    requestVersion.current += 1
    setExpanded(false)
    setLoading(false)
    setError(false)
  }

  async function loadBatch(batch: readonly CorpusMatchPair[]): Promise<void> {
    const currentVersion = ++requestVersion.current
    setLoading(true)
    setError(false)
    try {
      const additional = await textService.findChapterDisplay(
        chapterId,
        batch.map((pair) => pair.line),
        batch.map((pair) => pair.variant),
      )
      if (currentVersion !== requestVersion.current) return
      if (!containsRequestedPairs(additional, batch)) {
        setUnavailable(true)
        setLoading(false)
        return
      }
      setChapter((current) => mergeChapterDisplays(current, additional))
      setLoadedPairs((count) => count + batch.length)
      setExpanded(true)
      setLoading(false)
    } catch {
      if (currentVersion === requestVersion.current) {
        setLoading(false)
        setError(true)
      }
    }
  }

  function showMore(): void {
    if (loading) return
    if (!expanded && loadedPairs > initiallyVisible) {
      setExpanded(true)
      return
    }
    if (nextBatch.length > 0) void loadBatch(nextBatch)
  }

  return {
    chapter,
    loadedPairs,
    expanded,
    loading,
    error,
    unavailable,
    remaining,
    nextBatchSize: nextBatch.length,
    showMore,
    collapse,
  }
}
