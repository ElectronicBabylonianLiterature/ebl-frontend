import React from 'react'
import withData from 'http/withData'
import TextService from 'corpus/application/TextService'
import { CorpusQueryItem } from 'query/QueryResult'
import { Col, Row } from 'react-bootstrap'
import { ChapterId, chapterIdToString } from 'transliteration/domain/chapter-id'
import { ChapterDisplay } from 'corpus/domain/chapter'
import { Markdown } from 'common/ui/Markdown'
import { genreFromAbbr } from 'corpus/ui/Corpus'
import CorpusChapterMatches from 'corpus/ui/search/CorpusChapterMatches'
import {
  CorpusMatchPair,
  uniqueCorpusMatchPairs,
} from 'corpus/ui/search/CorpusMatchPairs'
import useNearViewport from 'common/hooks/useNearViewport'

function GenreInfoRow({
  chapterId,
  textName,
  url,
}: {
  chapterId: ChapterId
  textName: string
  url: string
}): JSX.Element {
  return (
    <Row>
      <Col className="justify-content-left fragment-result__match-info text-secondary">
        <a href={url} target="_blank" rel="noopener noreferrer">
          <small>
            <Markdown text={genreFromAbbr(chapterId.textId.genre)} />
            {textName && (
              <>
                &nbsp;&gt;&nbsp;
                <Markdown text={textName} />
              </>
            )}
            {' > '}
            {`${chapterIdToString(chapterId)} `}
            <i className="fas fa-external-link-alt" aria-hidden="true" />
          </small>
        </a>
      </Col>
    </Row>
  )
}

const ChapterResult = withData<
  {
    chapterId: ChapterId
    textService: TextService
    pairs: readonly CorpusMatchPair[]
    variantsToShow: number
  },
  {
    textService: TextService
    active: number
  },
  ChapterDisplay
>(
  ({
    data: chapterDisplay,
    chapterId,
    pairs,
    textService,
    variantsToShow,
  }): JSX.Element => {
    return (
      <>
        <GenreInfoRow
          chapterId={chapterId}
          textName={chapterDisplay.textName}
          url={chapterDisplay.url}
        />
        <CorpusChapterMatches
          initialChapter={chapterDisplay}
          chapterId={chapterId}
          pairs={pairs}
          initiallyVisible={Math.min(pairs.length, variantsToShow)}
          textService={textService}
        />
        <hr />
      </>
    )
  },
  ({ textService, chapterId, pairs, variantsToShow }) =>
    textService.findChapterDisplay(
      chapterId,
      pairs.slice(0, variantsToShow).map((pair) => pair.line),
      pairs.slice(0, variantsToShow).map((pair) => pair.variant),
    ),
  {
    watch: ({ active }) => [active],
  },
)

export default function LazyChapterResult({
  chapter,
  textService,
  variantsToShow,
  pageIndex,
}: {
  chapter: CorpusQueryItem
  textService: TextService
  variantsToShow: number
  pageIndex: number
}): JSX.Element {
  const { containerRef, isNearViewport } = useNearViewport('400px')
  const chapterId: ChapterId = {
    textId: chapter.textId,
    name: chapter.name,
    stage: chapter.stage,
  }
  const pairs = uniqueCorpusMatchPairs(chapter.lines, chapter.variants)
  if (pairs.length === 0) {
    return (
      <div className="corpus-search__chapter-slot">
        <p>
          Matching lines are unavailable for {chapterIdToString(chapterId)}.
        </p>
      </div>
    )
  }
  return (
    <div className="corpus-search__chapter-slot" ref={containerRef}>
      {isNearViewport && (
        <ChapterResult
          textService={textService}
          chapterId={chapterId}
          active={pageIndex}
          pairs={pairs}
          variantsToShow={variantsToShow}
        />
      )}
      {!isNearViewport && (
        <p>Chapter {chapterIdToString(chapterId)} loads as you scroll.</p>
      )}
    </div>
  )
}
