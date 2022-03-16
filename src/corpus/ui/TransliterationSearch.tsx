import React, { Fragment } from 'react'
import { Table } from 'react-bootstrap'
import _ from 'lodash'
import withData from 'http/withData'
import TextService from 'corpus/application/TextService'
import { Line } from 'corpus/domain/line'
import TransliterationSearchResult from 'corpus/domain/TransliterationSearchResult'
import ChapterLink from './ChapterLink'
import DisplayTextId from './DisplayTextId'
import { chapterIdToString } from 'transliteration/domain/chapter-id'

function Lines({
  searchResult: { matchingLines, siglums },
}: {
  searchResult: TransliterationSearchResult
}): JSX.Element {
  return (
    <>
      {matchingLines.map((line: Line, index: number) => (
        <p key={index}>
          {line.variants.map((variant, index) => (
            <Fragment key={index}>
              {index > 0 && <br />}
              {line.number}. {variant.reconstruction}
              {variant.manuscripts.map((manuscript, index) => (
                <Fragment key={index}>
                  <br />
                  {siglums[String(manuscript.manuscriptId)]}{' '}
                  {manuscript.labels.join(' ')} {manuscript.number}.{' '}
                  {manuscript.atf}
                </Fragment>
              ))}
            </Fragment>
          ))}
        </p>
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
      {_.map(matchingColophonLines, (lines: string[], manuscriptId: string) => (
        <p key={manuscriptId}>
          {lines.map((line, index) => (
            <Fragment key={index}>
              {index > 0 && <br />}
              {siglums[manuscriptId]} {line}
            </Fragment>
          ))}
        </p>
      ))}
    </>
  )
}

function TransliterationSearch({
  results,
}: {
  results: readonly TransliterationSearchResult[]
}): JSX.Element {
  return (
    <Table responsive>
      <thead>
        <tr>
          <th>Text</th>
          <th>Chapter</th>
          <th>Matching Lines</th>
        </tr>
      </thead>
      <tbody>
        {results.map((searchResult, index: number) => (
          <tr key={index}>
            <td>
              <DisplayTextId id={searchResult.id.textId} />
            </td>
            <td>
              <ChapterLink id={searchResult.id}>
                {chapterIdToString(searchResult.id)}
              </ChapterLink>
            </td>
            <td>
              <Lines searchResult={searchResult} />
              <Colophons searchResult={searchResult} />
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  )
}

export default withData<
  { transliteration: string | null | undefined },
  { textService: TextService },
  readonly TransliterationSearchResult[]
>(
  ({ transliteration, data }) =>
    transliteration ? <TransliterationSearch results={data} /> : null,
  (props) =>
    props.textService.searchTransliteration(props.transliteration ?? ''),
  {
    watch: (props) => [props.transliteration],
    filter: (props) => !_.isEmpty(props.transliteration),
    defaultData: [],
  }
)
