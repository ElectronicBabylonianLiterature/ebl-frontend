import React, { useContext, useMemo } from 'react'
import _ from 'lodash'
import { ChapterDisplay, ChapterId, LineDisplay } from 'corpus/domain/chapter'
import withData from 'http/withData'
import { LineColumns } from 'transliteration/ui/line-tokens'
import Markup from 'transliteration/ui/markup'
import lineNumberToString from 'transliteration/domain/lineNumberToString'
import { TextLineColumn } from 'transliteration/domain/columns'
import classNames from 'classnames'
import TextService from 'corpus/application/TextService'
import { LineDetails, ManuscriptLineDisplay } from 'corpus/domain/line-details'
import classnames from 'classnames'
import { Collapse, OverlayTrigger, Popover } from 'react-bootstrap'
import { isTextLine } from 'transliteration/domain/type-guards'
import RowsContext from './RowsContext'
import TranslationContext from './TranslationContext'

const lineNumberColumns = 1
const toggleColumns = 2
const translationColumns = lineNumberColumns + 1

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

function Translation({
  line,
  language,
}: {
  line: LineDisplay
  language: string
}): JSX.Element {
  const translation = line.translation.filter(
    (translation) => translation.language === language
  )
  return translation.length > 0 ? (
    <>
      <LineNumber line={line} />
      <td className="chapter-display__translation">
        <Markup parts={translation[0].parts} />
      </td>
    </>
  ) : (
    <td colSpan={translationColumns} />
  )
}

function Manuscript({
  manuscript,
  maxColumns,
}: {
  manuscript: ManuscriptLineDisplay
  maxColumns: number
}): JSX.Element {
  return (
    <tr
      className={classnames({
        'chapter-display__manuscript': true,
        'chapter-display__manuscript--standard': manuscript.isStandardText,
      })}
    >
      <td>
        <span className="chapter-display__manuscript-siglum">
          {manuscript.isParallelText && '// '}
          {manuscript.siglum}
        </span>
      </td>
      <td>
        <span className="chapter-display__manuscript-labels">
          {manuscript.labels.join(' ')}{' '}
          {manuscript.number !== null &&
            `${lineNumberToString(manuscript.number)}.`}
        </span>
      </td>
      {isTextLine(manuscript.line) ? (
        <LineColumns
          columns={manuscript.line.columns}
          maxColumns={maxColumns}
        />
      ) : (
        <td colSpan={maxColumns}></td>
      )}
      <td>
        <span className="chapter-display__manuscript-paratext">
          {manuscript.dollarLines
            .map((dollarLine) => dollarLine.displayValue)
            .join(' ')}
        </span>
      </td>
      <td>
        {manuscript.hasNotes && (
          <OverlayTrigger
            rootClose
            overlay={
              <Popover
                id={_.uniqueId('ManuscriptLineNotesPopOver-')}
                className=""
              >
                <Popover.Content>
                  <ol className="chapter-display__manuscript-notes">
                    {manuscript.noteLines.map((note, index) => (
                      <Markup key={index} container="li" parts={note.parts} />
                    ))}
                  </ol>
                </Popover.Content>
              </Popover>
            }
            trigger={['click']}
            placement="top"
          >
            <i className="fas fa-book chapter-display__manuscript-info-toggle"></i>
          </OverlayTrigger>
        )}
      </td>
    </tr>
  )
}

const Score = withData<
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
      <tbody>
        {line.sortedManuscripts.map((manuscript, index) => (
          <Manuscript
            manuscript={manuscript}
            key={index}
            maxColumns={line.numberOfColumns}
          />
        ))}
      </tbody>
    </table>
  ),
  ({ id, lineNumber, textService }) =>
    textService.findChapterLine(id, lineNumber)
)

export function ChapterViewLine({
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
  const scoreId = _.uniqueId('score-')
  const noteId = _.uniqueId('note-')
  const parallelsId = _.uniqueId('parallels-')
  const totalColumns =
    toggleColumns + lineNumberColumns + maxColumns + translationColumns
  const [
    {
      [lineNumber]: {
        score: showScore,
        note: showNote,
        parallels: showParallels,
      },
    },
    dispatchRows,
  ] = useContext(RowsContext)
  const [{ language }] = useContext(TranslationContext)

  const transliteration = useMemo(
    () => (
      <>
        <LineNumber line={line} />
        <LineColumns columns={columns} maxColumns={maxColumns} />
      </>
    ),
    [columns, line, maxColumns]
  )
  const score = useMemo(
    () => (
      <Collapse in={showScore} mountOnEnter>
        <tr id={scoreId}>
          <td colSpan={totalColumns}>
            <Score
              id={chapter.id}
              lineNumber={lineNumber}
              textService={textService}
            />
          </td>
        </tr>
      </Collapse>
    ),
    [chapter.id, lineNumber, scoreId, showScore, textService, totalColumns]
  )
  const note = useMemo(
    () =>
      line.note && (
        <Collapse in={showNote} mountOnEnter>
          <tr id={noteId}>
            <td colSpan={totalColumns}>
              <Markup
                className="chapter-display__note"
                parts={line.note.parts}
              />
            </td>
          </tr>
        </Collapse>
      ),
    [line.note, noteId, showNote, totalColumns]
  )
  const parallels = useMemo(
    () =>
      line.parallelLines.length > 0 && (
        <Collapse in={showParallels} mountOnEnter>
          <tr id={parallelsId}>
            <td colSpan={totalColumns}>
              <ul className="chapter-display__parallels">
                {line.parallelLines.map((parallelLine, index) => (
                  <li key="value">
                    {'// '}
                    {parallelLine.content.map(({ value }) => value).join('')}
                  </li>
                ))}
              </ul>
            </td>
          </tr>
        </Collapse>
      ),
    [line.parallelLines, parallelsId, showParallels, totalColumns]
  )

  return (
    <>
      <InterText line={line} colSpan={totalColumns} />
      <tr
        className={classNames({
          'chapter-display__line': true,
          'chapter-display__line--is-second-line-of-parallelism':
            line.isSecondLineOfParallelism,
          'chapter-display__line--is-beginning-of-section':
            line.isBeginningOfSection,
        })}
      >
        <td
          className="chapter-display__toggle"
          onClick={() => dispatchRows({ type: 'toggleScore', row: lineNumber })}
        >
          <i
            className={classNames({
              fas: true,
              'fa-caret-right': !showScore,
              'fa-caret-down': showScore,
            })}
            aria-expanded={showScore}
            aria-controls={scoreId}
            aria-label="Show score"
            role="button"
          ></i>
        </td>
        {transliteration}
        <td
          className="chapter-display__toggle"
          onClick={() => dispatchRows({ type: 'toggleNote', row: lineNumber })}
        >
          {line.note && (
            <i
              className={classNames({
                fas: true,
                'fa-book': !showNote,
                'fa-book-open': showNote,
              })}
              aria-expanded={showNote}
              aria-controls={noteId}
              aria-label="Show note"
              role="button"
            ></i>
          )}
        </td>
        <td
          className="chapter-display__toggle"
          onClick={() =>
            dispatchRows({ type: 'toggleParallels', row: lineNumber })
          }
        >
          {line.parallelLines.length > 0 && (
            <i
              className={classNames({
                fas: true,
                'fa-quote-right': true,
              })}
              aria-expanded={showParallels}
              aria-controls={parallelsId}
              aria-label="Show parallels"
              role="button"
            ></i>
          )}
        </td>
        <Translation line={line} language={language} />
      </tr>
      {note}
      {parallels}
      {score}
    </>
  )
}
