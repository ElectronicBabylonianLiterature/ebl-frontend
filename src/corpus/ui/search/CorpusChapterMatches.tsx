import React, { useCallback, useEffect, useId, useRef } from 'react'
import { Col, Row } from 'react-bootstrap'
import TextService from 'corpus/application/TextService'
import { ChapterDisplay } from 'corpus/domain/chapter'
import { ChapterId, chapterIdToString } from 'transliteration/domain/chapter-id'
import { CorpusMatchPair } from 'corpus/ui/search/CorpusMatchPairs'
import useCorpusChapterMatches from 'corpus/ui/search/useCorpusChapterMatches'
import { ChapterViewTable } from 'corpus/ui/ChapterView'
import RowsContext, { useRowsContext } from 'corpus/ui/RowsContext'
import TranslationContext, {
  useTranslationContext,
} from 'corpus/ui/TranslationContext'

export {
  CORPUS_MATCH_BATCH_SIZE,
  uniqueCorpusMatchPairs,
  mergeChapterDisplays,
} from 'corpus/ui/search/CorpusMatchPairs'

function useMatchControlRef(
  restoreFocus: React.MutableRefObject<boolean>,
): readonly [
  React.MutableRefObject<HTMLButtonElement | null>,
  React.RefCallback<HTMLButtonElement>,
] {
  const control = useRef<HTMLButtonElement | null>(null)
  const setControl = useCallback(
    (element: HTMLButtonElement | null): void => {
      if (element === null && control.current === document.activeElement) {
        restoreFocus.current = true
      }
      control.current = element
    },
    [restoreFocus],
  )
  return [control, setControl]
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
  const {
    chapter,
    loadedPairs,
    expanded,
    loading,
    error,
    unavailable,
    remaining,
    nextBatchSize,
    showMore,
    collapse,
  } = useCorpusChapterMatches(
    initialChapter,
    chapterId,
    pairs,
    initiallyVisible,
    textService,
  )
  const matchesId = useId()
  const descriptionId = useId()
  const controls = useRef<HTMLDivElement>(null)
  const restoreFocus = useRef(false)
  const [primaryControl, setPrimaryControl] = useMatchControlRef(restoreFocus)
  const [, setSecondaryControl] = useMatchControlRef(restoreFocus)
  const shownChapter = expanded ? chapter : initialChapter
  const showControls = pairs.length > initiallyVisible || error || unavailable
  const canShowMore =
    (!expanded && loadedPairs > initiallyVisible) ||
    (!unavailable && (remaining > 0 || !expanded))
  const expandedOrLoading = expanded || loading
  const showPrimaryControl = canShowMore || expandedOrLoading
  const showSecondaryControl = canShowMore && expandedOrLoading

  useEffect(() => {
    if (restoreFocus.current) {
      ;(primaryControl.current ?? controls.current)?.focus()
      restoreFocus.current = false
    }
  }, [expanded, loading, primaryControl, unavailable])

  function collapseMatches(): void {
    restoreFocus.current = true
    collapse()
  }

  const moreLabel = loading
    ? 'Loading chapter matches…'
    : error
      ? 'Retry loading chapter matches'
      : !expanded && loadedPairs > initiallyVisible
        ? 'Show loaded chapter matches'
        : `Show ${nextBatchSize} more match${nextBatchSize === 1 ? '' : 'es'}`

  const matchStatus = loading
    ? 'Loading more matches'
    : expanded
      ? `Showing ${Math.min(loadedPairs, pairs.length)} of ${pairs.length} matches`
      : ''

  return (
    <div aria-busy={loading}>
      {pairs.length > initiallyVisible && (
        <span role="status" className="visually-hidden">
          {matchStatus}
        </span>
      )}
      <span
        id={descriptionId}
        className="visually-hidden"
        data-testid="chapter-match-description"
      >
        Chapter {chapterIdToString(chapterId)}
      </span>
      <div id={matchesId} data-testid="chapter-matches">
        <ChapterTable
          key={`${loadedPairs}:${expanded}`}
          chapter={shownChapter}
          textService={textService}
        />
      </div>
      {showControls && (
        <Row>
          <Col
            ref={controls}
            className="corpus-search__match-controls"
            role="group"
            aria-label="Chapter match controls"
            aria-describedby={descriptionId}
            tabIndex={-1}
          >
            {showPrimaryControl && (
              <button
                ref={setPrimaryControl}
                type="button"
                className="btn btn-link p-0"
                aria-expanded={expanded}
                aria-controls={matchesId}
                aria-describedby={descriptionId}
                aria-disabled={loading}
                onClick={canShowMore ? showMore : collapseMatches}
              >
                {canShowMore ? moreLabel : 'Collapse chapter matches'}
              </button>
            )}
            {showSecondaryControl && (
              <button
                ref={setSecondaryControl}
                type="button"
                className="btn btn-link p-0"
                aria-expanded={expanded}
                aria-controls={matchesId}
                aria-describedby={descriptionId}
                onClick={collapseMatches}
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
