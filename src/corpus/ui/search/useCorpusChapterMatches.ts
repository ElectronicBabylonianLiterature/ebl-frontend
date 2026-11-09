import {
  Dispatch,
  MutableRefObject,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from 'react'
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

interface MatchBatchContext {
  requestVersion: MutableRefObject<number>
  activeBatch: MutableRefObject<AbortController | null>
  chapterId: ChapterId
  textService: TextService
  setChapter: Dispatch<SetStateAction<ChapterDisplay>>
  setLoadedPairs: Dispatch<SetStateAction<number>>
  setExpanded: Dispatch<SetStateAction<boolean>>
  setLoading: Dispatch<SetStateAction<boolean>>
  setError: Dispatch<SetStateAction<boolean>>
  setUnavailable: Dispatch<SetStateAction<boolean>>
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

function cancelActiveBatch(
  requestVersion: MutableRefObject<number>,
  activeBatch: MutableRefObject<AbortController | null>,
): void {
  requestVersion.current += 1
  activeBatch.current?.abort()
  activeBatch.current = null
}

async function loadChapterMatchBatch(
  batch: readonly CorpusMatchPair[],
  {
    requestVersion,
    activeBatch,
    chapterId,
    textService,
    setChapter,
    setLoadedPairs,
    setExpanded,
    setLoading,
    setError,
    setUnavailable,
  }: MatchBatchContext,
): Promise<void> {
  const currentVersion = ++requestVersion.current
  const controller = new AbortController()
  activeBatch.current = controller
  setLoading(true)
  setError(false)
  try {
    const additional = await textService.findChapterDisplay(
      chapterId,
      batch.map((pair) => pair.line),
      batch.map((pair) => pair.variant),
      controller.signal,
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
  } finally {
    if (activeBatch.current === controller) {
      activeBatch.current = null
    }
  }
}

export default function useCorpusChapterMatches(
  initialChapter: ChapterDisplay,
  chapterId: ChapterId,
  pairs: readonly CorpusMatchPair[],
  initiallyVisible: number,
  textService: TextService,
): ChapterMatchState {
  const requestVersion = useRef(0)
  const activeBatch = useRef<AbortController | null>(null)
  const [chapter, setChapter] = useState(initialChapter)
  const [loadedPairs, setLoadedPairs] = useState(initiallyVisible)
  const [expanded, setExpanded] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [unavailable, setUnavailable] = useState(false)

  useEffect(() => () => cancelActiveBatch(requestVersion, activeBatch), [])

  const remaining = Math.max(pairs.length - loadedPairs, 0)
  const nextBatch = pairs.slice(
    loadedPairs,
    loadedPairs + CORPUS_MATCH_BATCH_SIZE,
  )

  function collapse(): void {
    cancelActiveBatch(requestVersion, activeBatch)
    setExpanded(false)
    setLoading(false)
    setError(false)
  }

  function showMore(): void {
    if (loading) return
    if (!expanded && loadedPairs > initiallyVisible) {
      setExpanded(true)
      return
    }
    if (nextBatch.length > 0) {
      void loadChapterMatchBatch(nextBatch, {
        requestVersion,
        activeBatch,
        chapterId,
        textService,
        setChapter,
        setLoadedPairs,
        setExpanded,
        setLoading,
        setError,
        setUnavailable,
      })
    }
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
