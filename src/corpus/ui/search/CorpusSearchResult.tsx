import React, { useState } from 'react'
import withData from 'http/withData'
import TextService from 'corpus/application/TextService'
import { CorpusQuery } from 'query/CorpusQuery'
import { CorpusQueryItem, CorpusQueryResult } from 'query/QueryResult'
import { Col, Row } from 'react-bootstrap'
import _ from 'lodash'
import { ResultPagination } from 'fragmentarium/ui/search/FragmentariumSearchResult'
import { ChapterId, chapterIdToString } from 'transliteration/domain/chapter-id'
import { ChapterDisplay } from 'corpus/domain/chapter'
import { ChapterViewTable } from '../ChapterView'
import RowsContext, { useRowsContext } from '../RowsContext'
import TranslationContext, {
  useTranslationContext,
} from '../TranslationContext'
import { Markdown } from 'common/Markdown'
import { genreFromAbbr } from '../Corpus'

export const variantsToShow = 3

const ChapterResult = withData<
  {
    queryLemmas?: readonly string[]
    chapterId: ChapterId
    textService: TextService
    lines: readonly number[]
    variants: readonly number[]
  },
  {
    textService: TextService
    active: number
  },
  ChapterDisplay
>(
  ({ data: chapterDisplay, chapterId, lines, textService }): JSX.Element => {
    const rowsContext = useRowsContext(chapterDisplay.lines.length, true)
    const translationContext = useTranslationContext()
    const totalLines = lines.length

    return (
      <>
        <Row>
          <Col className="justify-content-center fragment-result__match-info">
            <small>
              <Markdown text={genreFromAbbr(chapterId.textId.genre)} />
              {chapterDisplay.textName && (
                <>
                  &nbsp;&gt;&nbsp;
                  <Markdown text={chapterDisplay.textName} />
                </>
              )}
              {' > '}
              {chapterIdToString(chapterId)}
            </small>
          </Col>
        </Row>
        <Row>
          <RowsContext.Provider value={rowsContext}>
            <TranslationContext.Provider value={translationContext}>
              <ChapterViewTable
                textService={textService}
                chapter={chapterDisplay}
                correctedLineNumbers={lines}
                activeLine={''}
              />
            </TranslationContext.Provider>
          </RowsContext.Provider>
        </Row>
        {totalLines > variantsToShow && (
          <Row>
            <td>And {totalLines - variantsToShow} more</td>
          </Row>
        )}
        <hr />
      </>
    )
  },
  ({ textService, chapterId, lines, variants }) =>
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
            lines={chapter.lines}
            variants={chapter.variants}
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
            variantsToShow={variantsToShow}
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
