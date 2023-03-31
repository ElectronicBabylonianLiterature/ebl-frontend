import React, { PropsWithChildren, useContext, useMemo, useState } from 'react'
import _ from 'lodash'
import {
  ChapterDisplay,
  LineDisplay,
  LineVariantDisplay,
} from 'corpus/domain/chapter'
import { LineColumns } from 'transliteration/ui/line-tokens'
import Markup from 'transliteration/ui/markup'
import lineNumberToString from 'transliteration/domain/lineNumberToString'
import { TextLineColumn } from 'transliteration/domain/columns'
import classNames from 'classnames'
import TextService from 'corpus/application/TextService'
import { Collapse } from 'react-bootstrap'
import RowsContext from './RowsContext'
import TranslationContext from './TranslationContext'
import Score from './Score'
import Parallels from './Parallels'
import { createColumns } from 'transliteration/domain/columns'
import { numberToUnicodeSubscript } from 'transliteration/application/SubIndex'
import LineNumber from './LineNumber'
import { LineGroup, LineInfo } from 'transliteration/ui/LineGroup'
import { LineGroupContext } from 'transliteration/ui/LineGroupContext'

const lineNumberColumns = 1
const toggleColumns = 3
const translationColumns = lineNumberColumns + 1

function InterText({
  variant,
  colSpan,
  hasIntertext,
}: {
  variant: LineVariantDisplay
  colSpan: number
  hasIntertext: boolean
}): JSX.Element {
  return (
    <>
      {hasIntertext && (
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
  correctedLineNumber,
  correctedVariantNumber,
  line,
  columns,
  maxColumns,
  textService,
  activeLine,
  expandLineLinks,
}: {
  chapter: ChapterDisplay
  lineNumber: number
  correctedLineNumber?: number
  correctedVariantNumber?: number
  line: LineDisplay
  columns: readonly TextLineColumn[]
  maxColumns: number
  textService: TextService
  activeLine: string
  expandLineLinks?: boolean
}): JSX.Element {
  return (
    <>
      {line.variants.map((variants, variantNumber) => (
        <ChapterViewLineVariant
          key={variantNumber}
          chapter={chapter}
          lineNumber={lineNumber}
          correctedLineNumber={correctedLineNumber}
          correctedVariantNumber={correctedVariantNumber}
          line={line}
          variantNumber={variantNumber}
          columns={columns}
          maxColumns={maxColumns}
          textService={textService}
          activeLine={activeLine}
          expandLineLinks={expandLineLinks}
        />
      ))}
    </>
  )
}

function TransliterationColumns({
  variantNumber,
  line,
  activeLine,
  columns,
  maxColumns,
  showMeter,
  showOldLineNumbers,
  lineNumberUrl,
}: {
  variantNumber: number
  line: LineDisplay
  activeLine: string
  columns: readonly TextLineColumn[]
  maxColumns: number
  showMeter: boolean
  showOldLineNumbers: boolean
  lineNumberUrl?: string | null
}): JSX.Element {
  return (
    <>
      {variantNumber === 0 ? (
        <LineNumber
          line={line}
          activeLine={activeLine}
          showOldLineNumbers={showOldLineNumbers}
          url={lineNumberUrl}
        />
      ) : (
        <td className="chapter-display__variant">
          <span>{`variant${numberToUnicodeSubscript(
            variantNumber
          )}:\xa0`}</span>
        </td>
      )}
      <LineColumns
        columns={columns}
        maxColumns={maxColumns}
        showMeter={showMeter}
        isInLineGroup={true}
      />
    </>
  )
}

export function ChapterViewLineVariant({
  chapter,
  lineNumber,
  correctedLineNumber,
  correctedVariantNumber,
  line,
  variantNumber,
  maxColumns,
  textService,
  activeLine,
  expandLineLinks,
}: {
  chapter: ChapterDisplay
  lineNumber: number
  correctedLineNumber?: number
  correctedVariantNumber?: number
  line: LineDisplay
  variantNumber: number
  columns: readonly TextLineColumn[]
  maxColumns: number
  textService: TextService
  activeLine: string
  expandLineLinks?: boolean
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
        notes: showNotes,
        parallels: showParallels,
        oldLineNumbers: showOldLineNumbers,
        meter: showMeter,
      },
    },
    dispatchRows,
  ] = useContext(RowsContext)

  const [{ language }] = useContext(TranslationContext)
  const variant = line.variants[variantNumber]
  const isPrimaryVariant = variantNumber === 0
  const hasIntertext = variant.intertext.length > 0

  const columns = useMemo(() => createColumns(variant.reconstruction), [
    variant.reconstruction,
  ])

  // Forces an update; some time later we should re-implement lineGroup
  // along the lines of RowsContext
  const [, highlightIndexSetter] = useState(0)
  const lineGroup = useMemo(() => {
    const lineInfo: LineInfo = {
      chapterId: chapter.id,
      lineNumber: correctedLineNumber ?? lineNumber,
      variantNumber: correctedVariantNumber ?? variantNumber,
      textService: textService,
    }
    return new LineGroup(variant.reconstruction, lineInfo, highlightIndexSetter)
  }, [
    chapter.id,
    correctedLineNumber,
    correctedVariantNumber,
    lineNumber,
    variantNumber,
    textService,
    variant.reconstruction,
  ])

  const transliteration = useMemo(
    () => (
      <TransliterationColumns
        variantNumber={variantNumber}
        line={line}
        activeLine={activeLine}
        columns={columns}
        maxColumns={maxColumns}
        showMeter={showMeter}
        showOldLineNumbers={showOldLineNumbers}
        lineNumberUrl={expandLineLinks ? chapter.url : null}
      />
    ),
    [
      variantNumber,
      line,
      activeLine,
      columns,
      maxColumns,
      showMeter,
      showOldLineNumbers,
      expandLineLinks,
      chapter.url,
    ]
  )
  const score = useMemo(
    () => (
      <CollapsibleRow show={showScore} id={scoreId} totalColumns={totalColumns}>
        <Score lineGroup={lineGroup} />
      </CollapsibleRow>
    ),
    [lineGroup, scoreId, showScore, totalColumns]
  )
  const note = useMemo(
    () =>
      variant.note && (
        <CollapsibleRow
          show={showNotes}
          id={noteId}
          totalColumns={totalColumns}
        >
          <Markup
            className="chapter-display__note"
            parts={variant.note?.parts ?? []}
          />
        </CollapsibleRow>
      ),
    [variant, noteId, showNotes, totalColumns]
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

  const scoreCaret = (
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
  )

  return (
    <LineGroupContext.Provider value={lineGroup}>
      <InterText
        variant={variant}
        colSpan={totalColumns}
        hasIntertext={hasIntertext}
      />
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
          onClick={() =>
            dispatchRows({ type: 'toggle', target: 'score', row: lineNumber })
          }
        >
          {isPrimaryVariant && scoreCaret}
        </td>
        {transliteration}
        <td
          className="chapter-display__toggle"
          onClick={() =>
            dispatchRows({ type: 'toggle', target: 'notes', row: lineNumber })
          }
        >
          {variant.note && (
            <i
              className={classNames({
                fas: true,
                'fa-book': !showNotes,
                'fa-book-open': showNotes,
              })}
              aria-expanded={showNotes}
              aria-controls={noteId}
              aria-label="Show notes"
              role="button"
            ></i>
          )}
        </td>
        <td
          className="chapter-display__toggle"
          onClick={() =>
            dispatchRows({
              type: 'toggle',
              target: 'parallels',
              row: lineNumber,
            })
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
    </LineGroupContext.Provider>
  )
}
