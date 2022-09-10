import React from 'react'
import { Col, Row, Table } from 'react-bootstrap'
import _ from 'lodash'
import withData from 'http/withData'
import TextService from 'corpus/application/TextService'
import { Line } from 'corpus/domain/line'
import TransliterationSearchResult from 'corpus/domain/TransliterationSearchResult'
import ChapterLink from './ChapterLink'
import DisplayTextId from './DisplayTextId'
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
  searchResult: { matchingLines, siglums },
}: {
  searchResult: TransliterationSearchResult
}): JSX.Element {
  return (
    <>
      {matchingLines.map((line: Line, index: number) => (
        <React.Fragment key={index}>
          {line.variants.map((variant, index) => (
            <React.Fragment key={index}>
              <tr>
                <span className="line_number">{line.number}. </span>
                <LineTokens content={variant.reconstructionTokens} />
              </tr>
              {variant.manuscripts.map((manuscript, index) => (
                <React.Fragment key={index}>
                  <tr key={index}>
                    <span>
                      {siglums[String(manuscript.manuscriptId)]}{' '}
                      {manuscript.labels.join(' ')} {manuscript.number}.{' '}
                    </span>
                    <DisplayTokens tokens={manuscript.atfTokens} />
                  </tr>
                </React.Fragment>
              ))}
            </React.Fragment>
          ))}
        </React.Fragment>
      ))}
    </>
  )
}

function Colophons({
  searchResult: { matchingColophonLines, siglums },
}: {
  searchResult: TransliterationSearchResult
}): JSX.Element {
  return (
    <>
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
    </>
  )
}

function TransliterationSearch({
  chapterInfo,
}: {
  chapterInfo: TransliterationSearchResult
  key: number
}): JSX.Element {
  return (
    <tr>
      <td>
        <DisplayTextId id={chapterInfo.id.textId} />
      </td>
      <td>
        <ChapterLink id={chapterInfo.id}>
          {chapterIdToString(chapterInfo.id)}
        </ChapterLink>
      </td>
      <td>
        <Lines searchResult={chapterInfo} />
        <Colophons searchResult={chapterInfo} />
      </td>
    </tr>
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
  ) => Bluebird<readonly TransliterationSearchResult[]>
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
          <Table responsive>
            <thead>
              <tr>
                <th>Text</th>
                <th>Chapter</th>
                <th>Matching Lines</th>
              </tr>
            </thead>
            <tbody>{PaginationElementComponent}</tbody>
          </Table>
        </Col>
      </Row>
      <Row></Row>
    </>
  )
  return (
    <Pagination<TransliterationSearchResult>
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
        <TransliterationSearch key={key} chapterInfo={data} />
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
