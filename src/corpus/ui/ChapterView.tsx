import React from 'react'
import AppContent from 'common/AppContent'
import { SectionCrumb, TextCrumb } from 'common/Breadcrumbs'
import { ChapterId } from 'corpus/application/TextService'
import { ChapterDisplay, LineDisplay } from 'corpus/domain/chapter'
import withData from 'http/withData'
import CorpusTextCrumb from './CorpusTextCrumb'
import GenreCrumb from './GenreCrumb'
import { ChapterTitle } from './chapter-title'
import InlineMarkdown from 'common/InlineMarkdown'
import { LineColumns } from 'transliteration/ui/line-tokens'
import Markup from 'transliteration/ui/markup'
import lineNumberToString from 'transliteration/domain/lineNumberToString'
import {
  createColumns,
  maxColumns,
  numberOfColumns,
  TextLineColumn,
} from 'transliteration/domain/columns'

interface Props {
  chapter: ChapterDisplay
}

function Title({ chapter }: Props): JSX.Element {
  return (
    <>
      <InlineMarkdown source={chapter.textName} />
      <br />
      <small>
        Chapter{' '}
        <ChapterTitle
          showStage={!chapter.isSingleStage}
          chapter={{
            ...chapter.id,
            title: chapter.title,
            uncertainFragments: [],
          }}
        />
      </small>
    </>
  )
}

function LineNumber({ line }: { line: LineDisplay }): JSX.Element {
  return (
    <td className="chapter-display__line-number">
      {lineNumberToString(line.number)}
    </td>
  )
}

function Line({
  line,
  columns,
  maxColumns,
}: {
  line: LineDisplay
  columns: readonly TextLineColumn[]
  maxColumns: number
}): JSX.Element {
  const emptyColumns = maxColumns - numberOfColumns(columns)
  return (
    <>
      {line.intertext.length > 0 && (
        <tr className="chapter-display__intertext">
          <td colSpan={maxColumns + 3}>
            (<Markup container="span" parts={line.intertext} />)
          </td>
        </tr>
      )}
      <tr>
        <LineNumber line={line} />
        <LineColumns columns={columns} maxColumns={maxColumns} />
        {emptyColumns > 0 && <td colSpan={emptyColumns} />}
        <LineNumber line={line} />
        <td className="chapter-display__translation">
          <Markup parts={line.translation} />
        </td>
      </tr>
    </>
  )
}

function ChapterView({ chapter }: Props): JSX.Element {
  const columns = chapter.lines.map((line) =>
    createColumns(line.reconstruction)
  )
  const maxColumns_ = maxColumns(columns)
  return (
    <AppContent
      crumbs={[
        new SectionCrumb('Corpus'),
        new GenreCrumb(chapter.id.textId.genre),
        CorpusTextCrumb.ofChapterDisplay(chapter),
        new TextCrumb(`Chapter ${chapter.id.stage} ${chapter.id.name}`),
      ]}
      title={<Title chapter={chapter} />}
    >
      <table className="chapter-display">
        {chapter.lines.map((line, index) => (
          <Line
            key={index}
            line={line}
            columns={columns[index]}
            maxColumns={maxColumns_}
          />
        ))}
      </table>
    </AppContent>
  )
}

export default withData<
  {
    textService
  },
  { id: ChapterId },
  ChapterDisplay
>(
  ({ data, ...props }) => <ChapterView chapter={data} {...props} />,
  ({ id, textService }) => textService.findChapterDisplay(id),
  {
    watch: (props) => [props.id],
  }
)
