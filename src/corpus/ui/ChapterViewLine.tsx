import React, {
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from 'react'
import _ from 'lodash'
import { ChapterDisplay, LineDisplay } from 'corpus/domain/chapter'
import { LineColumns } from 'transliteration/ui/line-tokens'
import Markup from 'transliteration/ui/markup'
import lineNumberToString, {
  lineNumberToAtf,
} from 'transliteration/domain/lineNumberToString'
import { TextLineColumn } from 'transliteration/domain/columns'
import classNames from 'classnames'
import TextService from 'corpus/application/TextService'
import { Collapse } from 'react-bootstrap'
import RowsContext from './RowsContext'
import TranslationContext from './TranslationContext'
import { Anchor } from 'transliteration/ui/line-number'
import Score from './Score'
import Parallels from './Parallels'

const lineNumberColumns = 1
const toggleColumns = 3
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

function LineNumber({
  line,
  activeLine,
}: {
  line: LineDisplay
  activeLine: string
}): JSX.Element {
  const ref = useRef<HTMLAnchorElement>(null)
  const id = lineNumberToAtf(line.number)

  useEffect(() => {
    if (id === activeLine) {
      ref.current?.scrollIntoView()
    }
  }, [id, activeLine])

  return (
    <td className="chapter-display__line-number">
      <Anchor className="chapter-display__anchor" id={id} ref={ref}>
        {lineNumberToString(line.number)}
      </Anchor>
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
      <td className="chapter-display__line-number">
        {lineNumberToString(line.number)}
      </td>
      <td className="chapter-display__translation">
        <Markup parts={translation[0].parts} />
      </td>
    </>
  ) : (
    <td colSpan={translationColumns} />
  )
}

function CollapsibleRow({
  show,
  id,
  totalColumns,
  children,
}: PropsWithChildren<{
  show: boolean
  id: string
  totalColumns: number
}>): JSX.Element {
  return (
    <Collapse in={show} mountOnEnter>
      <tr id={id}>
        <td colSpan={totalColumns}>{children}</td>
      </tr>
    </Collapse>
  )
}

export function ChapterViewLine({
  chapter,
  lineNumber,
  line,
  columns,
  maxColumns,
  textService,
  activeLine,
}: {
  chapter: ChapterDisplay
  lineNumber: number
  line: LineDisplay
  columns: readonly TextLineColumn[]
  maxColumns: number
  textService: TextService
  activeLine: string
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
        <LineNumber line={line} activeLine={activeLine} />
        <LineColumns columns={columns} maxColumns={maxColumns} />
      </>
    ),
    [activeLine, columns, line, maxColumns]
  )
  const score = useMemo(
    () => (
      <CollapsibleRow show={showScore} id={scoreId} totalColumns={totalColumns}>
        <Score
          id={chapter.id}
          lineNumber={lineNumber}
          textService={textService}
        />
      </CollapsibleRow>
    ),
    [chapter.id, lineNumber, scoreId, showScore, textService, totalColumns]
  )
  const note = useMemo(
    () =>
      line.note && (
        <CollapsibleRow show={showNote} id={noteId} totalColumns={totalColumns}>
          <Markup className="chapter-display__note" parts={line.note.parts} />
        </CollapsibleRow>
      ),
    [line.note, noteId, showNote, totalColumns]
  )
  const parallels = useMemo(
    () =>
      line.parallelLines.length > 0 && (
        <CollapsibleRow
          show={showParallels}
          id={parallelsId}
          totalColumns={totalColumns}
        >
          <Parallels lines={line.parallelLines} />
        </CollapsibleRow>
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
