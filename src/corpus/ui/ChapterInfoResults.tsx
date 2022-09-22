import React from 'react'
import { Col, Row, Table } from 'react-bootstrap'
import _ from 'lodash'
import withData from 'http/withData'
import TextService from 'corpus/application/TextService'
import ChapterInfo, { ChapterInfoLine } from 'corpus/domain/ChapterInfo'
import ChapterLink from './ChapterLink'
import { chapterIdToString } from 'transliteration/domain/chapter-id'
import Pagination from 'fragmentarium/ui/search/Pagination'
import ChapterInfosPagination from 'corpus/domain/ChapterInfosPagination'
import Bluebird from 'bluebird'
import { Token } from 'transliteration/domain/token'
import {
  createColumns,
  lineAccFromColumns,
} from 'transliteration/domain/columns'
import { LineTokens } from 'transliteration/ui/line-tokens'
import lineNumberToString from 'transliteration/domain/lineNumberToString'
import { genreFromAbbr } from 'corpus/ui/Corpus'
import Markup from 'transliteration/ui/markup'

function DisplayTokens({
  tokens,
}: {
  tokens: readonly Token[]
  maxColumns?: number
}): JSX.Element {
  const columns = createColumns(tokens)
  const lineAccumulator = lineAccFromColumns(columns)
  return <>{lineAccumulator.flatResult}</>
}

function Lines({
  searchResult: { matchingLines, siglums, id },
}: {
  searchResult: ChapterInfo
}): JSX.Element {
  return (
    <Table>
      {matchingLines.map((line: ChapterInfoLine, index: number) => (
        <React.Fragment key={index}>
          {line.variants.map((variant, index) => (
            <React.Fragment key={index}>
              <tr>
                <span className={'h5'}>
                  <ChapterLink id={id}>{line.number}.</ChapterLink>
                </span>
                <span className={'h5'}>
                  <LineTokens content={variant.reconstructionTokens} />
                </span>
              </tr>
              <tr>
                {line.translation.map((translation, index) => (
                  <Markup
                    key={index}
                    className={'ml-4 h5 mb-0'}
                    parts={translation.parts}
                  />
                ))}
              </tr>
              {variant.manuscripts.map((manuscript, index) => (
                <React.Fragment key={index}>
                  <tr key={index}>
                    <div className={'ml-5'}>
                      {siglums[String(manuscript.manuscriptId)]}{' '}
                      {manuscript.labels.join(' ')} {manuscript.number}.{' '}
                      <DisplayTokens tokens={manuscript.atfTokens} />
                    </div>
                  </tr>
                </React.Fragment>
              ))}
            </React.Fragment>
          ))}
          <br />
        </React.Fragment>
      ))}
    </Table>
  )
}

function Colophons({
  searchResult: { matchingColophonLines, siglums },
}: {
  searchResult: ChapterInfo
}): JSX.Element {
  return (
    <Table>
      {Object.entries(matchingColophonLines).map((colophon, index) => (
        <React.Fragment key={index}>
          {colophon[1].map((line, index) => (
            <tr key={index}>
              {siglums[colophon[0]]} {lineNumberToString(line.lineNumber)}{' '}
              <DisplayTokens tokens={line.content} />
            </tr>
          ))}
        </React.Fragment>
      ))}
    </Table>
  )
}

function ChapterInfoResults({
  chapterInfo,
}: {
  chapterInfo: ChapterInfo
  key: number
}): JSX.Element {
  return (
    <>
      <Row className="justify-content-center">
        <h5 className={'text-secondary'}>
          {genreFromAbbr(chapterInfo.id.textId.genre)}
          {chapterInfo.textName && ` > ${chapterInfo.textName}`}
          {' > '}
          {chapterIdToString(chapterInfo.id)}
        </h5>
      </Row>
      <Row>
        <Lines searchResult={chapterInfo} />
      </Row>
      <Row>
        <Colophons searchResult={chapterInfo} />
      </Row>
      <hr />
    </>
  )
}

function TransliterationSearchPagination({
  chapterInfosPagination,
  searchPagination,
  paginationIndex,
}: {
  chapterInfosPagination: ChapterInfosPagination
  searchPagination: (
    paginationIndex: number
  ) => Bluebird<readonly ChapterInfo[]>
  paginationIndex: number
}): JSX.Element {
  const Component = ({
    PaginationControlsComponent,
    PaginationElementComponent,
  }: {
    PaginationControlsComponent: JSX.Element
    PaginationElementComponent: JSX.Element
  }): JSX.Element => (
    <>
      <Row>
        <Col xs={{ offset: 5 }} className={'mt-2'}>
          {PaginationControlsComponent}
        </Col>
      </Row>
      <Row>
        <Col>
          <hr />
          {PaginationElementComponent}
        </Col>
      </Row>
      <Row></Row>
    </>
  )
  return (
    <Pagination<ChapterInfo>
      paginationURLParam={'paginationIndexCorpus'}
      paginationElements={chapterInfosPagination.chapterInfos}
      totalCount={chapterInfosPagination.totalCount}
      searchPagination={searchPagination}
      paginationIndex={paginationIndex}
      renderPagination={(
        PaginationControlsComponent,
        PaginationElementComponent
      ) => (
        <Component
          PaginationControlsComponent={PaginationControlsComponent}
          PaginationElementComponent={PaginationElementComponent}
        />
      )}
      renderPaginationElement={(data, key) => (
        <ChapterInfoResults key={key} chapterInfo={data} />
      )}
    />
  )
}

export default withData<
  {
    transliteration: string
    textService: TextService
    paginationIndex: number
  },
  { textService: TextService },
  ChapterInfosPagination
>(
  ({ transliteration, data, textService, paginationIndex }) =>
    transliteration && data.chapterInfos.length > 0 ? (
      <TransliterationSearchPagination
        chapterInfosPagination={data}
        searchPagination={(paginationIndex: number) =>
          textService
            .searchTransliteration(transliteration, paginationIndex)
            .then((result) => result.chapterInfos)
        }
        paginationIndex={paginationIndex}
      />
    ) : null,
  (props) =>
    props.textService.searchTransliteration(props.transliteration ?? '', 0),
  {
    watch: (props) => [props.transliteration],
    filter: (props) => !_.isEmpty(props.transliteration),
    defaultData: () => ({ chapterInfos: [], totalCount: 0 }),
  }
)
