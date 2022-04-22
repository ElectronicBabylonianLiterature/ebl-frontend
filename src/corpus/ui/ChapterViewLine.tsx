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
import { createColumns } from 'transliteration/domain/columns'
import { numberToUnicodeSubscript } from 'transliteration/ui/SubIndex'
import { LineVariantDisplay } from 'corpus/domain/line-details'

const lineNumberColumns = 1
const toggleColumns = 3
const translationColumns = lineNumberColumns + 1

function InterText({
  variant,
  colSpan,
}: {
  variant: LineVariantDisplay
  colSpan: number
}): JSX.Element {
  return (
    <>
      {variant.intertext.length > 0 && (
        <tr>
          <td colSpan={colSpan} className="chapter-display__intertext">
            (
            <Markup container="span" parts={variant.intertext} />)
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
  const variants = useMemo(
    () =>
      line.variants.map((variant, variantNumber) => {
        return (
          <ChapterViewLineVariant
            key={variantNumber}
            chapter={chapter}
            lineNumber={lineNumber}
            line={line}
            variantNumber={variantNumber}
            columns={columns}
            maxColumns={maxColumns}
            textService={textService}
            activeLine={activeLine}
          />
        )
      }),
    [chapter, lineNumber, line, columns, maxColumns, textService, activeLine]
  )
  return <>{variants}</>
}

export function ChapterViewLineVariant({
  chapter,
  lineNumber,
  line,
  variantNumber,
  maxColumns,
  textService,
  activeLine,
}: {
  chapter: ChapterDisplay
  lineNumber: number
  line: LineDisplay
  variantNumber: number
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
  const variant = line.variants[variantNumber]
  const isPrimaryVariant = variantNumber === 0

  const columns = useMemo(() => createColumns(variant.reconstruction), [
    variant,
  ])

  const transliteration = useMemo(
    () => (
      <>
        {isPrimaryVariant ? (
          <LineNumber line={line} activeLine={activeLine} />
        ) : (
          <td style={{ textAlign: 'right' }}>
            <span>{`variant${numberToUnicodeSubscript(
              variantNumber
            )}:\xa0`}</span>
          </td>
        )}
        <LineColumns columns={columns} maxColumns={maxColumns} />
      </>
    ),
    [activeLine, columns, line, variantNumber, isPrimaryVariant, maxColumns]
  )
  const score = useMemo(
    () => (
      <CollapsibleRow show={showScore} id={scoreId} totalColumns={totalColumns}>
        <Score
          id={chapter.id}
          lineNumber={lineNumber}
          variantNumber={variantNumber}
          textService={textService}
        />
      </CollapsibleRow>
    ),
    [
      chapter.id,
      lineNumber,
      variantNumber,
      scoreId,
      showScore,
      textService,
      totalColumns,
    ]
  )
  const note = useMemo(
    () =>
      variant.note && (
        <CollapsibleRow show={showNote} id={noteId} totalColumns={totalColumns}>
          <Markup
            className="chapter-display__note"
            parts={variant.note?.parts ?? []}
          />
        </CollapsibleRow>
      ),
    [variant, noteId, showNote, totalColumns]
  )
  const parallels = useMemo(
    () =>
      variant.parallelLines.length > 0 && (
        <CollapsibleRow
          show={showParallels}
          id={parallelsId}
          totalColumns={totalColumns}
        >
          <Parallels lines={variant.parallelLines} />
        </CollapsibleRow>
      ),
    [variant, parallelsId, showParallels, totalColumns]
  )

  const scoreCaret = useMemo(
    () => (
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
    ),
    [showScore, scoreId]
  )

  return (
    <>
      <InterText variant={variant} colSpan={totalColumns} />
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
          {isPrimaryVariant && scoreCaret}
        </td>
        {transliteration}
        <td
          className="chapter-display__toggle"
          onClick={() => dispatchRows({ type: 'toggleNote', row: lineNumber })}
        >
          {variant.note && (
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
          {variant.parallelLines.length > 0 && (
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
        {isPrimaryVariant && <Translation line={line} language={language} />}
      </tr>
      {note}
      {parallels}
      {score}
    </>
  )
}
