import React, { useContext } from 'react'
import Bluebird from 'bluebird'
import AppContent from 'common/AppContent'
import { LinkContainer } from 'react-router-bootstrap'
import { SectionCrumb } from 'common/Breadcrumbs'
import { ChapterDisplay, ChapterId, LineDisplay } from 'corpus/domain/chapter'
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
  TextLineColumn,
} from 'transliteration/domain/columns'
import { Button, ButtonGroup } from 'react-bootstrap'
import SessionContext from 'auth/SessionContext'
import classNames from 'classnames'
import ChapterCrumb from './ChapterCrumb'
import { Text } from 'corpus/domain/text'
import GotoButton from './GotoButton'

import './ChapterView.sass'

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

function InterText({
  line,
  colSpan,
}: {
  line: LineDisplay
  colSpan: number
}): JSX.Element {
  return (
    <>
      {line.intertext.length > 0 && (
        <tr>
          <td colSpan={colSpan} className="chapter-display__intertext">
            (<Markup container="span" parts={line.intertext} />)
          </td>
        </tr>
      )}
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

function Translation({ line }: { line: LineDisplay }): JSX.Element {
  return line.translation.length > 0 ? (
    <>
      <LineNumber line={line} />
      <td className="chapter-display__translation">
        <Markup parts={line.translation} />
      </td>
    </>
  ) : (
    <td colSpan={2} />
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
  return (
    <>
      <InterText line={line} colSpan={maxColumns + 3} />
      <tr
        className={classNames({
          'chapter-display__line': true,
          'chapter-display__line--is-second-line-of-parallelism':
            line.isSecondLineOfParallelism,
          'chapter-display__line--is-beginning-of-section':
            line.isBeginningOfSection,
        })}
      >
        <LineNumber line={line} />
        <LineColumns columns={columns} maxColumns={maxColumns} />
        <Translation line={line} />
      </tr>
    </>
  )
}

function EditChapterButton({
  chapter,
}: {
  chapter: ChapterDisplay
}): JSX.Element {
  const session = useContext(SessionContext)
  return (
    <LinkContainer
      to={`/corpus/${encodeURIComponent(
        chapter.id.textId.genre
      )}/${encodeURIComponent(chapter.id.textId.category)}/${encodeURIComponent(
        chapter.id.textId.index
      )}/${encodeURIComponent(chapter.id.stage)}/${encodeURIComponent(
        chapter.id.name
      )}/edit`}
    >
      <Button
        variant="outline-primary"
        disabled={!session.isAllowedToWriteTexts()}
      >
        <i className="fas fa-edit"></i> Edit
      </Button>
    </LinkContainer>
  )
}

function ChapterView({ chapter, text }: Props & { text: Text }): JSX.Element {
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
        new ChapterCrumb(chapter.id),
      ]}
      title={<Title chapter={chapter} />}
      actions={
        <ButtonGroup>
          <GotoButton
            text={text}
            as={ButtonGroup}
            title="Go to"
            variant="outline-primary"
          />
          <EditChapterButton chapter={chapter} />
        </ButtonGroup>
      }
    >
      <table className="chapter-display">
        <tbody>
          {chapter.lines.map((line, index) => (
            <Line
              key={index}
              line={line}
              columns={columns[index]}
              maxColumns={maxColumns_}
            />
          ))}
        </tbody>
      </table>
    </AppContent>
  )
}

export default withData<
  {
    textService
  },
  { id: ChapterId },
  [ChapterDisplay, Text]
>(
  ({ data: [chapter, text], ...props }) => (
    <ChapterView chapter={chapter} text={text} {...props} />
  ),
  ({ id, textService }) =>
    Bluebird.all([
      textService.findChapterDisplay(id),
      textService.find(id.textId),
    ]),
  {
    watch: (props) => [props.id],
  }
)
