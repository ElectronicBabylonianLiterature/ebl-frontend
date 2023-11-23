import React, { useState } from 'react'
import withData from 'http/withData'
import TextService from 'corpus/application/TextService'
import { CorpusQuery } from 'query/CorpusQuery'
import { CorpusQueryItem, CorpusQueryResult } from 'query/QueryResult'
import { Col, Row } from 'react-bootstrap'
import _ from 'lodash'
import { ResultPageButtons } from 'common/ResultPageButtons'
import { ChapterId, chapterIdToString } from 'transliteration/domain/chapter-id'
import { ChapterDisplay } from 'corpus/domain/chapter'
import { ChapterViewTable } from '../ChapterView'
import RowsContext, { useRowsContext } from '../RowsContext'
import TranslationContext, {
  useTranslationContext,
} from '../TranslationContext'
import { Markdown } from 'common/Markdown'
import { genreFromAbbr } from '../Corpus'

function GenreInfoRow({
  chapterId,
  textName,
}: {
  chapterId: ChapterId
  textName: string
}): JSX.Element {
  return (
    <Row>
      <Col className="justify-content-center fragment-result__match-info text-secondary">
        <small>
          <Markdown text={genreFromAbbr(chapterId.textId.genre)} />
          {textName && (
            <>
              &nbsp;&gt;&nbsp;
              <Markdown text={textName} />
            </>
          )}
          {' > '}
          {chapterIdToString(chapterId)}
        </small>
      </Col>
    </Row>
  )
}

const ChapterResult = withData<
  {
    queryLemmas?: readonly string[]
    chapterId: ChapterId
    textService: TextService
    lines: readonly number[]
    variants: readonly number[]
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
    lines,
    textService,
    variantsToShow,
  }): JSX.Element => {
    const rowsContext = useRowsContext(chapterDisplay.lines.length, true)
    const translationContext = useTranslationContext()
    const totalLines = lines.length

    return (
      <>
        <GenreInfoRow
          chapterId={chapterId}
          textName={chapterDisplay.textName}
        />
        <Row>
          <RowsContext.Provider value={rowsContext}>
            <TranslationContext.Provider value={translationContext}>
              <ChapterViewTable
                textService={textService}
                chapter={chapterDisplay}
                activeLine={''}
                expandLineLinks={true}
              />
            </TranslationContext.Provider>
          </RowsContext.Provider>
        </Row>
        {totalLines > variantsToShow && (
          <Row>
            <Col className="justify-content-center fragment-result__match-info">
              And {totalLines - variantsToShow} more
            </Col>
          </Row>
        )}
        <hr />
      </>
    )
  },
  ({ textService, chapterId, lines, variants, variantsToShow }) =>
    textService.findChapterDisplay(
      chapterId,
      _.take(lines, variantsToShow),
      _.take(variants, variantsToShow)
    ),
  {
    watch: ({ active }) => [active],
  }
)

function ResultPages({
  textService,
  chapters,
  queryLemmas,
  variantsToShow,
}: {
  textService: TextService
  chapters: readonly CorpusQueryItem[]
  queryLemmas?: readonly string[]
  variantsToShow: number
}): JSX.Element {
  const [active, setActive] = useState(0)
  const pages = _.chunk(chapters, 10)

  const pageButtons = (
    <ResultPageButtons pages={pages} active={active} setActive={setActive} />
  )

  return (
    <>
      {pageButtons}

      {pages[active].map((chapter, index) => {
        const chapterId = {
          textId: chapter.textId,
          name: chapter.name,
          stage: chapter.stage,
        }
        return (
          <ChapterResult
            key={index}
            textService={textService}
            chapterId={chapterId}
            active={active}
            queryLemmas={queryLemmas}
            lines={chapter.lines}
            variants={chapter.variants}
            variantsToShow={variantsToShow}
          />
        )
      })}

      {pageButtons}
    </>
  )
}

export const CorpusSearchResult = withData<
  { textService: TextService; corpusQuery: CorpusQuery },
  unknown,
  CorpusQueryResult
>(
  ({ data, textService, corpusQuery }): JSX.Element => {
    const chapterCount = data.items.length
    return (
      <>
        <Row>
          <Col className="justify-content-center fragment-result__match-info">
            {`Found ${data.matchCountTotal.toLocaleString()} line${
              data.matchCountTotal === 1 ? '' : 's'
            } in ${chapterCount.toLocaleString()} chapter${
              chapterCount === 1 ? '' : 's'
            }`}
          </Col>
        </Row>

        {chapterCount > 0 && (
          <ResultPages
            chapters={data.items}
            textService={textService}
            queryLemmas={corpusQuery.lemmas?.split('+')}
            variantsToShow={Math.max(
              _.trimEnd(corpusQuery.transliteration || '').split('\n').length,
              3
            )}
          />
        )}
      </>
    )
  },
  ({ textService, corpusQuery }) => textService.query(corpusQuery),
  {
    watch: ({ corpusQuery }) => [corpusQuery],
  }
)
