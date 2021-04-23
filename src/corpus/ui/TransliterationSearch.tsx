import React, { Fragment } from 'react'
import { Table } from 'react-bootstrap'
import _ from 'lodash'
import { numberToRoman } from 'big-roman'
import withData from 'http/withData'
import { Link } from 'react-router-dom'
import TextService from 'corpus/application/TextService'
import { Line } from 'corpus/domain/line'
import TransliterationSearchResult, {
  ChapterInfo,
} from 'corpus/domain/TransliterationSearchResult'

function Lines({ chapterInfo }: { chapterInfo: ChapterInfo }): JSX.Element {
  return (
    <>
      {chapterInfo.matchingLines.map((line: Line, index: number) => (
        <p key={index}>
          {line.variants.map((variant, index) => (
            <Fragment key={index}>
              {index > 0 && <br />}
              {line.number}. {variant.reconstruction}
              {variant.manuscripts.map((manuscript, index) => (
                <Fragment key={index}>
                  <br />
                  {chapterInfo.siglums[String(manuscript.manuscriptId)]}{' '}
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

function Colophons({ chapterInfo }: { chapterInfo: ChapterInfo }): JSX.Element {
  return (
    <>
      {_.map(
        chapterInfo.matchingColophonLines,
        (lines: string[], manuscriptId: string) => (
          <p key={manuscriptId}>
            {lines.map((line, index) => (
              <Fragment key={index}>
                {index > 0 && <br />}
                {chapterInfo.siglums[manuscriptId]} {line}
              </Fragment>
            ))}
          </p>
        )
      )}
    </>
  )
}

function TransliterationSearch({
  textInfos,
}: {
  textInfos: readonly TransliterationSearchResult[]
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
        {textInfos.flatMap((textInfo) =>
          textInfo.matchingChapters.map((chapterInfo, index: number) => (
            <tr key={index}>
              <td>
                {textInfo.id.category && numberToRoman(textInfo.id.category)}.
                {textInfo.id.index}
              </td>
              <td>
                <Link
                  to={`/corpus/${textInfo.id.category}/${textInfo.id.index}/${chapterInfo.id.stage}/${chapterInfo.id.name}`}
                >
                  {chapterInfo.id.stage}
                  {chapterInfo.id.name !== '-' && ` ${chapterInfo.id.name}`}
                </Link>
              </td>
              <td>
                <Lines chapterInfo={chapterInfo} />
                <Colophons chapterInfo={chapterInfo} />
              </td>
            </tr>
          ))
        )}
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
    transliteration ? <TransliterationSearch textInfos={data} /> : null,
  (props) =>
    props.textService.searchTransliteration(props.transliteration ?? ''),
  {
    watch: (props) => [props.transliteration],
    filter: (props) => !_.isEmpty(props.transliteration),
    defaultData: [],
  }
)
