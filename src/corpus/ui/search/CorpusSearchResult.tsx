import React, { useState } from 'react'
import withData from 'http/withData'
import TextService from 'corpus/application/TextService'
import { CorpusQuery } from 'query/CorpusQuery'
import { CorpusQueryItem, CorpusQueryResult } from 'query/QueryResult'
import { Col, Row } from 'react-bootstrap'
import _ from 'lodash'
import { ResultPagination } from 'fragmentarium/ui/search/FragmentariumSearchResult'
import { ChapterId } from 'transliteration/domain/chapter-id'
import { ChapterDisplay } from 'corpus/domain/chapter'
import { ChapterViewTable } from '../ChapterView'
import RowsContext, { useRowsContext } from '../RowsContext'
import TranslationContext, {
  useTranslationContext,
} from '../TranslationContext'

export const variantsToShow = 2

const ChapterResult = withData<
  {
    queryLemmas?: readonly string[]
    lines: readonly number[]
    variants: readonly number[]
    chapterId: ChapterId
    textService: TextService
  },
  {
    textService: TextService
    active: number
  },
  ChapterDisplay
>(
  ({ data: chapter, textService }): JSX.Element => {
    const rowsContext = useRowsContext(chapter.lines.length)
    const translationContext = useTranslationContext()
    return (
      <RowsContext.Provider value={rowsContext}>
        <TranslationContext.Provider value={translationContext}>
          <ChapterViewTable
            textService={textService}
            chapter={chapter}
            activeLine={''}
          />
        </TranslationContext.Provider>
      </RowsContext.Provider>
    )
  },
  ({ textService, chapterId, lines, variants }) =>
    textService.findChapterDisplay(chapterId, lines, variants),
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

  return (
    <>
      <Row>
        <Col>
          <ResultPagination
            pages={pages}
            active={active}
            setActive={setActive}
          />
        </Col>
      </Row>

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
            lines={_.take(chapter.lines, variantsToShow)}
            variants={_.take(chapter.variants, variantsToShow)}
          />
        )
      })}

      <Row>
        <Col>
          <ResultPagination
            pages={pages}
            active={active}
            setActive={setActive}
          />
        </Col>
      </Row>
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
            <p>
              {`Found ${data.matchCountTotal.toLocaleString()} matching line${
                data.matchCountTotal === 1 ? '' : 's'
              } in ${chapterCount.toLocaleString()} chapter${
                chapterCount === 1 ? '' : 's'
              }`}
            </p>
          </Col>
        </Row>

        {chapterCount > 0 && (
          <ResultPages
            chapters={data.items}
            textService={textService}
            queryLemmas={corpusQuery.lemmas?.split('+')}
            variantsToShow={Math.max(
              _.trimEnd(corpusQuery.transliteration || '').split('\n').length,
              variantsToShow
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
