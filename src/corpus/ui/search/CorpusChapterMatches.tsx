import React, { useId } from 'react'
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
  const shownChapter = expanded ? chapter : initialChapter
  const showControls = pairs.length > initiallyVisible || error || unavailable
  const canShowMore = !unavailable && (remaining > 0 || !expanded)

  const moreLabel = loading
    ? 'Loading chapter matches…'
    : error
      ? 'Retry loading chapter matches'
      : !expanded && loadedPairs > initiallyVisible
        ? 'Show loaded chapter matches'
        : `Show ${nextBatchSize} more match${nextBatchSize === 1 ? '' : 'es'}`

  return (
    <div aria-busy={loading}>
      <span
        id={descriptionId}
        className="sr-only"
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
          <Col className="corpus-search__match-controls">
            {canShowMore && (
              <button
                type="button"
                className="btn btn-link p-0"
                aria-expanded={expanded}
                aria-controls={matchesId}
                aria-describedby={descriptionId}
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
                aria-controls={matchesId}
                aria-describedby={descriptionId}
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
