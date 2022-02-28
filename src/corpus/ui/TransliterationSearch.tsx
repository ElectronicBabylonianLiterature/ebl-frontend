import React, { Fragment } from 'react'
import { Table } from 'react-bootstrap'
import _ from 'lodash'
import romans from 'romans'
import withData from 'http/withData'
import { Link } from 'react-router-dom'
import TextService from 'corpus/application/TextService'
import { Line } from 'corpus/domain/line'
import TransliterationSearchResult from 'corpus/domain/TransliterationSearchResult'

const defaultName = '-'

function TextId({
  searchResult: {
    id: { textId },
  },
}: {
  searchResult: TransliterationSearchResult
}): JSX.Element {
  return (
    <>
      {textId.genre} {textId.category && romans.romanize(textId.category)}.
      {textId.index}
    </>
  )
}

function ChapterLink({
  searchResult: {
    id: { textId, stage, name },
  },
}: {
  searchResult: TransliterationSearchResult
}): JSX.Element {
  return (
    <Link
      to={`/corpus/${textId.genre}/${textId.category}/${textId.index}/${stage}/${name}`}
    >
      {stage}
      {name !== defaultName && ` ${name}`}
    </Link>
  )
}

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
              <TextId searchResult={searchResult} />
            </td>
            <td>
              <ChapterLink searchResult={searchResult} />
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
