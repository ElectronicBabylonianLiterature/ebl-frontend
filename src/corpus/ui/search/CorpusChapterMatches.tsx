import React, { useEffect, useRef, useState } from 'react'
import { Col, Row } from 'react-bootstrap'
import TextService from 'corpus/application/TextService'
import { ChapterDisplay, LineDisplay } from 'corpus/domain/chapter'
import { ChapterId } from 'transliteration/domain/chapter-id'
import { ChapterViewTable } from 'corpus/ui/ChapterView'
import RowsContext, { useRowsContext } from 'corpus/ui/RowsContext'
import TranslationContext, {
  useTranslationContext,
} from 'corpus/ui/TranslationContext'

export type CorpusMatchPair = {
  readonly line: number
  readonly variant: number
}
export const CORPUS_MATCH_BATCH_SIZE = 10

export function uniqueCorpusMatchPairs(
  lines: readonly number[],
  variants: readonly number[],
): CorpusMatchPair[] {
  const pairs: CorpusMatchPair[] = []
  const seen = new Set<string>()
  for (
    let index = 0;
    index < Math.min(lines.length, variants.length);
    index++
  ) {
    const line = lines[index]
    const variant = variants[index]
    if (
      !Number.isSafeInteger(line) ||
      line < 0 ||
      !Number.isSafeInteger(variant) ||
      variant < 0
    ) {
      continue
    }
    const key = `${line}:${variant}`
    if (!seen.has(key)) {
      seen.add(key)
      pairs.push({ line, variant })
    }
  }
  return pairs
}

export function mergeChapterDisplays(
  current: ChapterDisplay,
  additional: ChapterDisplay,
): ChapterDisplay {
  const lines = new Map<number, LineDisplay>(
    current.lines.map((line) => [line.originalIndex, line]),
  )
  for (const line of additional.lines) {
    const previous = lines.get(line.originalIndex)
    if (!previous) {
      lines.set(line.originalIndex, line)
      continue
    }
    const variants = new Map(
      previous.variants.map((variant) => [variant.originalIndex, variant]),
    )
    line.variants.forEach((variant) =>
      variants.set(variant.originalIndex, variant),
    )
    lines.set(line.originalIndex, {
      ...previous,
      variants: [...variants.values()]
        .sort((first, second) => first.originalIndex - second.originalIndex)
        .map((variant, index) => ({
          ...variant,
          isPrimaryVariant: index === 0,
        })),
    })
  }
  return new ChapterDisplay({
    ...current,
    lines: [...lines.values()].sort(
      (first, second) => first.originalIndex - second.originalIndex,
    ),
  })
}

function ChapterTable({
  chapter,
  textService,
}: {
  chapter: ChapterDisplay
  textService: TextService
}): JSX.Element {
  const rowsContext = useRowsContext(chapter.lines.length, true)
  const translationContext = useTranslationContext()
  return (
    <Row>
      <RowsContext.Provider value={rowsContext}>
        <TranslationContext.Provider value={translationContext}>
          <ChapterViewTable
            textService={textService}
            chapter={chapter}
            activeLine={''}
            expandLineLinks={true}
          />
        </TranslationContext.Provider>
      </RowsContext.Provider>
    </Row>
  )
}

export default function CorpusChapterMatches({
  initialChapter,
  chapterId,
  pairs,
  initiallyVisible,
  textService,
}: {
  initialChapter: ChapterDisplay
  chapterId: ChapterId
  pairs: readonly CorpusMatchPair[]
  initiallyVisible: number
  textService: TextService
}): JSX.Element {
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
  const shownChapter = expanded ? chapter : initialChapter

  function collapse(): void {
    requestVersion.current += 1
    setExpanded(false)
    setLoading(false)
    setError(false)
  }

  function showMore(): void {
    if (loading) {
      return
    }
    if (!expanded && loadedPairs > initiallyVisible) {
      setExpanded(true)
      return
    }
    if (nextBatch.length === 0) {
      return
    }
    const currentVersion = ++requestVersion.current
    setLoading(true)
    setError(false)
    textService
      .findChapterDisplay(
        chapterId,
        nextBatch.map((pair) => pair.line),
        nextBatch.map((pair) => pair.variant),
      )
      .then(
        (additional) => {
          if (currentVersion !== requestVersion.current) {
            return
          }
          const returnedPairs = new Set(
            additional.lines.flatMap((line) =>
              line.variants.map(
                (variant) => `${line.originalIndex}:${variant.originalIndex}`,
              ),
            ),
          )
          if (
            !nextBatch.every((pair) =>
              returnedPairs.has(`${pair.line}:${pair.variant}`),
            )
          ) {
            setUnavailable(true)
            setLoading(false)
            return
          }
          setChapter((current) => mergeChapterDisplays(current, additional))
          setLoadedPairs((count) => count + nextBatch.length)
          setExpanded(true)
          setLoading(false)
        },
        () => {
          if (currentVersion !== requestVersion.current) {
            return
          }
          setLoading(false)
          setError(true)
        },
      )
  }

  const moreLabel = loading
    ? 'Loading chapter matches…'
    : error
      ? 'Retry loading chapter matches'
      : !expanded && loadedPairs > initiallyVisible
        ? 'Show loaded chapter matches'
        : `Show ${nextBatch.length} more match${nextBatch.length === 1 ? '' : 'es'}`

  return (
    <div aria-busy={loading}>
      <ChapterTable
        key={`${loadedPairs}:${expanded}`}
        chapter={shownChapter}
        textService={textService}
      />
      {(pairs.length > initiallyVisible || error || unavailable) && (
        <Row>
          <Col className="corpus-search__match-controls">
            {!unavailable && (remaining > 0 || !expanded) && (
              <button
                type="button"
                className="btn btn-link p-0"
                aria-expanded={expanded}
                disabled={loading}
                onClick={showMore}
              >
                {moreLabel}
              </button>
            )}
            {(expanded || loading) && (
              <button
                type="button"
                className="btn btn-link p-0"
                aria-expanded={expanded}
                onClick={collapse}
              >
                {loading ? 'Cancel loading' : 'Collapse chapter matches'}
              </button>
            )}
            {error && <p role="alert">Could not load chapter matches.</p>}
            {unavailable && (
              <p role="alert">Additional chapter matches are unavailable.</p>
            )}
          </Col>
        </Row>
      )}
    </div>
  )
}
