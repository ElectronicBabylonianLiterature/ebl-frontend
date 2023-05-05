import React, { useState } from 'react'
import { Col, Row } from 'react-bootstrap'
import _ from 'lodash'
import withData from 'http/withData'
import TextService from 'corpus/application/TextService'
import ChapterInfo, { ChapterInfoLine } from 'corpus/domain/ChapterInfo'
import ChapterLink from 'corpus/ui/ChapterLink'
import { ChapterId, chapterIdToString } from 'transliteration/domain/chapter-id'
import Pagination from 'fragmentarium/ui/search/Pagination'
import ChapterInfosPagination from 'corpus/domain/ChapterInfosPagination'
import Bluebird from 'bluebird'
import { Token } from 'transliteration/domain/token'
import {
  createColumns,
  lineAccFromColumns,
} from 'transliteration/domain/columns'
import lineNumberToString from 'transliteration/domain/lineNumberToString'
import { genreFromAbbr } from 'corpus/ui/Corpus'
import { Markdown } from 'common/Markdown'
import Markup from 'transliteration/ui/markup'
import { TextLine } from 'transliteration/domain/text-line'
import {
  createLemmaMap,
  LemmaMap,
  LineLemmasContext,
} from 'transliteration/ui/LineLemmasContext'
import { ManuscriptLine } from 'corpus/domain/line'
import TranslationLine from 'transliteration/domain/translation-line'

function DisplayTokens({
  tokens,
}: {
  tokens: readonly Token[]
  maxColumns?: number
}): JSX.Element {
  const columns = createColumns(tokens)
  const lineAccumulator = lineAccFromColumns({ columns, highlightLemmas: [] })
  const [lemmaMap, lemmaSetter] = useState<LemmaMap>(
    createLemmaMap(lineAccumulator.lemmas)
  )
  return (
    <LineLemmasContext.Provider
      value={{
        lemmaMap: lemmaMap,
        lemmaSetter: lemmaSetter,
      }}
    >
      {lineAccumulator.flatResult}
    </LineLemmasContext.Provider>
  )
}

function MatchingLine({
  line,
  siglums,
  id,
}: {
  line: ChapterInfoLine
  siglums: Record<string, string>
  id: ChapterId
}): JSX.Element {
  const ReconstructionToken = ({
    lineNumber,
    reconstructionTokens,
  }: {
    lineNumber: string
    reconstructionTokens: readonly Token[]
  }) => (
    <span>
      <ChapterLink id={id}>{lineNumber}.</ChapterLink>
      <DisplayTokens tokens={reconstructionTokens} />
    </span>
  )

  const Translation = ({
    translation,
  }: {
    translation: readonly TranslationLine[]
  }) => (
    <>
      {translation.map((translation, index) => (
        <Row key={index}>
          <Col className={'ml-4'}>
            <Markup key={index} parts={translation.parts} />
          </Col>
        </Row>
      ))}
    </>
  )

  const Manuscripts = ({
    manuscripts,
  }: {
    manuscripts: readonly ManuscriptLine[]
  }) => (
    <>
      {manuscripts.map((manuscript, index) => (
        <Row key={index}>
          <small>
            <Col className={'ml-5 pl-1'}>
              {siglums[String(manuscript.manuscriptId)]}{' '}
              {manuscript.labels.join(' ')} {manuscript.number}.{' '}
              <DisplayTokens tokens={manuscript.atfTokens} />
            </Col>
          </small>
        </Row>
      ))}
    </>
  )
  return (
    <>
      {line.variants.map((variant, index) => (
        <React.Fragment key={index}>
          <Row>
            <ReconstructionToken
              lineNumber={line.number}
              reconstructionTokens={variant.reconstructionTokens}
            />
          </Row>
          <Row>
            <Translation translation={line.translation} />
          </Row>
          <Manuscripts manuscripts={variant.manuscripts} />
        </React.Fragment>
      ))}
      <br />
    </>
  )
}

function ColophonLine({
  colophonLine,
  colophonLineIndex,
  siglums,
}: {
  colophonLine: readonly TextLine[]
  colophonLineIndex: string
  siglums: Record<string, string>
}): JSX.Element {
  return (
    <>
      {colophonLine.map((line, index) => (
        <Row key={index}>
          {siglums[colophonLineIndex]} {lineNumberToString(line.lineNumber)}{' '}
          <td>
            {' '}
            <DisplayTokens tokens={line.content} />
          </td>
        </Row>
      ))}
    </>
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
      <hr />
      <Row className="justify-content-center">
        <div className={'text-secondary'}>
          <small>
            <Markdown text={genreFromAbbr(chapterInfo.id.textId.genre)} />
            {chapterInfo.textName && (
              <>
                &nbsp;&gt;&nbsp;
                <Markdown text={chapterInfo.textName} />
              </>
            )}
            {' > '}
            {chapterIdToString(chapterInfo.id)}
          </small>
        </div>
      </Row>
      {chapterInfo.matchingLines.map((line, index) => (
        <MatchingLine
          key={index}
          line={line}
          siglums={chapterInfo.siglums}
          id={chapterInfo.id}
        />
      ))}
      <small>
        {Object.entries(chapterInfo.matchingColophonLines).map(
          (colophon, index) => (
            <ColophonLine
              key={index}
              siglums={chapterInfo.siglums}
              colophonLineIndex={colophon[0]}
              colophonLine={colophon[1]}
            />
          )
        )}
      </small>
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
        <Col>{PaginationElementComponent}</Col>
      </Row>
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
