import React, { useState } from 'react'
import withData from 'http/withData'
import TextService from 'corpus/application/TextService'
import { CorpusQuery } from 'query/CorpusQuery'
import { CorpusQueryItem, CorpusQueryResult } from 'query/QueryResult'
import { Col, Row } from 'react-bootstrap'
import _ from 'lodash'
import { ResultPagination } from 'fragmentarium/ui/search/FragmentariumSearchResult'
import { LineDetails } from 'corpus/domain/line-details'
import { ChapterId } from 'transliteration/domain/chapter-id'

export const variantsToShow = 2
interface LineVariantItem {
  line: number
  variant: number
}
const ChapterLine = withData<
  {
    queryLemmas?: readonly string[]
    line: number
    variant: number
    chapterId: ChapterId
  },
  {
    textService: TextService
    active: number
  },
  LineDetails
>(
  ({ data: variantDetails, queryLemmas }): JSX.Element => {
    console.log(variantDetails)
    return <p>Line here</p> // TODO: use DictionaryLineDisplay
  },
  ({ textService, chapterId, line, variant }) =>
    textService.findChapterLine(chapterId, line, variant),
  {
    watch: ({ active }) => [active],
  }
)

function ChapterLines({
  textService,
  queryItem,
  active,
  queryLemmas,
  lineVariantsToShow,
}: {
  textService: TextService
  queryItem: CorpusQueryItem
  active: number
  queryLemmas?: readonly string[]
  lineVariantsToShow: { line: number; variant: number }[]
}): JSX.Element {
  const chapterId = {
    textId: queryItem.textId,
    name: queryItem.name,
    stage: queryItem.stage,
  }
  return (
    <>
      {lineVariantsToShow.map(({ line, variant }, index) => {
        return (
          <ChapterLine
            key={index}
            queryLemmas={queryLemmas}
            line={line}
            variant={variant}
            chapterId={chapterId}
            textService={textService}
            active={active}
          />
        )
      })}
    </>
  )
}

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
        const lineVariantsToShow = _.take(
          _.zip(chapter.lines, chapter.variants),
          variantsToShow
        ).map(([line, variant]) => ({ line, variant })) as LineVariantItem[]

        return (
          <ChapterLines
            key={index}
            textService={textService}
            queryItem={chapter}
            active={active}
            queryLemmas={queryLemmas}
            lineVariantsToShow={lineVariantsToShow}
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
              } in ${chapterCount.toLocaleString()} corpus chapter${
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
