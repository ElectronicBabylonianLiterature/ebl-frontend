import React, { useId } from 'react'
import { Row } from 'react-bootstrap'
import TextService from 'corpus/application/TextService'
import { ChapterDisplay } from 'corpus/domain/chapter'
import { ChapterId, chapterIdToString } from 'transliteration/domain/chapter-id'
import { CorpusMatchPair } from 'corpus/ui/search/CorpusMatchPairs'
import useCorpusChapterMatches from 'corpus/ui/search/useCorpusChapterMatches'
import CorpusMatchControls from './CorpusMatchControls'
import CorpusMatchStatus from './CorpusMatchStatus'
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
  const state = useCorpusChapterMatches(
    initialChapter,
    chapterId,
    pairs,
    initiallyVisible,
    textService,
  )
  const matchesId = useId()
  const descriptionId = useId()
  const showControls =
    pairs.length > initiallyVisible || state.error || state.unavailable
  return (
    <div aria-busy={state.loading}>
      {pairs.length > initiallyVisible && (
        <CorpusMatchStatus state={state} total={pairs.length} />
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
          key={`${state.loadedPairs}:${state.expanded}`}
          chapter={state.expanded ? state.chapter : initialChapter}
          textService={textService}
        />
      </div>
      {showControls && (
        <CorpusMatchControls
          state={state}
          initiallyVisible={initiallyVisible}
          matchesId={matchesId}
          descriptionId={descriptionId}
        />
      )}
    </div>
  )
}
