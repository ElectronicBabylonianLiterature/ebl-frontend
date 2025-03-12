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
import {
  createTokenPopover,
  ReconstructionPopover,
} from 'transliteration/ui/WordInfo'

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
  lineIndex,
  line,
  columns,
  maxColumns,
  textService,
  activeLine,
  expandLineLinks,
}: {
  chapter: ChapterDisplay
  lineIndex: number
  line: LineDisplay
  columns: readonly TextLineColumn[]
  maxColumns: number
  textService: TextService
  activeLine: string
  expandLineLinks?: boolean
}): JSX.Element {
  return (
    <>
      {line.variants.map((variant, variantIndex) => (
        <ChapterViewLineVariant
          key={variantIndex}
          chapter={chapter}
          lineIndex={lineIndex}
          line={line}
          variant={variant}
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

export function ChapterViewLineVariant({
  chapter,
  lineIndex,
  line,
  variant,
  maxColumns,
  textService,
  activeLine,
  expandLineLinks,
}: {
  chapter: ChapterDisplay
  lineIndex: number
  variant: LineVariantDisplay
  line: LineDisplay
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
      [lineIndex]: {
        score: showScore,
        notes: showNotes,
        parallels: showParallels,
        oldLineNumbers: showOldLineNumbers,
        meter: showMeter,
        ipa: showIpa,
      },
    },
    dispatchRows,
  ] = useContext(RowsContext)

  const [{ language }] = useContext(TranslationContext)
  const hasIntertext = variant.intertext.length > 0

  const columns = useMemo(() => createColumns(variant.reconstruction), [
    variant.reconstruction,
  ])

  const [, highlightIndexSetter] = useState(0)
  const lineGroup = useMemo(() => {
    const lineInfo: LineInfo = {
      chapterId: chapter.id,
      lineNumber: line.originalIndex,
      variantNumber: variant.originalIndex,
      textService: textService,
    }
    return new LineGroup(variant.reconstruction, lineInfo, highlightIndexSetter)
  }, [
    chapter.id,
    line.originalIndex,
    variant.originalIndex,
    variant.reconstruction,
    textService,
  ])

  const transliteration = useMemo(() => {
    const variantLabel = (
      <span className="chapter-display__variant">{`variant${numberToUnicodeSubscript(
        variant.originalIndex
      )}:\xa0`}</span>
    )

    return (
      <>
        {variant.isPrimaryVariant ? (
          <LineNumber
            line={line}
            activeLine={activeLine}
            showOldLineNumbers={showOldLineNumbers}
            url={expandLineLinks ? chapter.url : null}
          >
            {variant.originalIndex > 0 && variantLabel}
          </LineNumber>
        ) : (
          <td>{variantLabel}</td>
        )}
        <LineColumns
          columns={columns}
          maxColumns={maxColumns}
          showMeter={showMeter}
          showIpa={showIpa}
          TokenActionWrapper={createTokenPopover(
            lineGroup,
            ReconstructionPopover
          )}
        />
      </>
    )
  }, [
    variant.originalIndex,
    variant.isPrimaryVariant,
    line,
    activeLine,
    showOldLineNumbers,
    expandLineLinks,
    chapter.url,
    columns,
    maxColumns,
    showMeter,
    showIpa,
    lineGroup,
  ])
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
            dispatchRows({ type: 'toggle', target: 'score', row: lineIndex })
          }
        >
          {variant.isPrimaryVariant && scoreCaret}
        </td>
        {transliteration}
        <td
          className="chapter-display__toggle"
          onClick={() =>
            dispatchRows({ type: 'toggle', target: 'notes', row: lineIndex })
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
              row: lineIndex,
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
        {variant.isPrimaryVariant && (
          <Translation line={line} language={language} />
        )}
      </tr>
      {note}
      {parallels}
      {score}
    </LineGroupContext.Provider>
  )
}
