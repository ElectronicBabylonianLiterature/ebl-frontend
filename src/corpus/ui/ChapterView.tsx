import React, { useContext, useState } from 'react'
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
import { LineColumns, LineTokens } from 'transliteration/ui/line-tokens'
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
import TextService from 'corpus/application/TextService'
import { LineDetails, ManuscriptLineDisplay } from 'corpus/domain/line-details'

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

function Manuscript({
  manuscript,
}: {
  manuscript: ManuscriptLineDisplay
}): JSX.Element {
  return (
    <tr>
      <td>
        <span className="chapter-display__manuscripts-siglum">
          {manuscript.siglum}
        </span>
      </td>
      <td>
        <span className="chapter-display__manuscripts-labels">
          {manuscript.labels.join(' ')}{' '}
          {manuscript.number !== null &&
            `${lineNumberToString(manuscript.number)}.`}
        </span>
      </td>
      <td>
        <LineTokens content={manuscript.line.content} />
      </td>
    </tr>
  )
}

const Manuscripts = withData<
  Record<string, unknown>,
  {
    id: ChapterId
    lineNumber: number
    textService: TextService
  },
  LineDetails
>(
  ({ data: line }): JSX.Element => (
    <table className="chapter-display__manuscripts">
      {line.variants
        .flatMap((variant) => variant.manuscripts)
        .map((manuscript, index) => (
          <Manuscript manuscript={manuscript} key={index} />
        ))}
    </table>
  ),
  ({ id, lineNumber, textService }) =>
    textService.findChapterLine(id, lineNumber)
)

function Line({
  chapter,
  lineNumber,
  line,
  columns,
  maxColumns,
  textService,
}: {
  chapter: ChapterDisplay
  lineNumber: number
  line: LineDisplay
  columns: readonly TextLineColumn[]
  maxColumns: number
  textService: TextService
}): JSX.Element {
  const [showManuscripts, setShowManuscripts] = useState(false)
  return (
    <>
      <InterText line={line} colSpan={maxColumns + 3} />
      <tr
        onClick={() => setShowManuscripts(!showManuscripts)}
        className={classNames({
          'chapter-display__line': true,
          'chapter-display__line--is-second-line-of-parallelism':
            line.isSecondLineOfParallelism,
          'chapter-display__line--is-beginning-of-section':
            line.isBeginningOfSection,
        })}
      >
        <td className="chapter-display__line-toggle">
          <i
            className={classNames({
              fas: true,
              'fa-caret-right': !showManuscripts,
              'fa-caret-down': showManuscripts,
            })}
            aria-expanded={showManuscripts}
          ></i>
        </td>
        <LineNumber line={line} />
        <LineColumns columns={columns} maxColumns={maxColumns} />
        <Translation line={line} />
      </tr>
      {showManuscripts && (
        <tr>
          <td colSpan={maxColumns + 3}>
            <Manuscripts
              id={chapter.id}
              lineNumber={lineNumber}
              textService={textService}
            />
          </td>
        </tr>
      )}
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

function ChapterView({
  chapter,
  text,
  textService,
}: Props & { text: Text; textService: TextService }): JSX.Element {
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
            <>
              <Line
                key={index}
                line={line}
                columns={columns[index]}
                maxColumns={maxColumns_}
                chapter={chapter}
                lineNumber={index}
                textService={textService}
              />
            </>
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
