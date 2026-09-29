import React, { useContext, useMemo } from 'react'
import _ from 'lodash'
import {
  ChapterDisplay,
  LineDisplay,
  LineVariantDisplay,
} from 'corpus/domain/chapter'
import Markup from 'transliteration/ui/markup'
import { TextLineColumn } from 'transliteration/domain/columns'
import classNames from 'classnames'
import TextService from 'corpus/application/TextService'
import RowsContext from 'corpus/ui/RowsContext'
import TranslationContext from 'corpus/ui/TranslationContext'
import Score from 'corpus/ui/Score'
import Parallels from 'corpus/ui/Parallels'
import {
  CollapsibleRow,
  InterText,
  lineNumberColumns,
  toggleColumns,
  Translation,
  translationColumns,
} from 'corpus/ui/ChapterViewLineRows'
import { ToggleCell, ToggleIcon } from 'corpus/ui/ChapterViewLineToggles'
import { useVariantTransliteration } from 'corpus/ui/useVariantTransliteration'

interface ChapterViewLineProps {
  chapter: ChapterDisplay
  lineIndex: number
  line: LineDisplay
  columns: readonly TextLineColumn[]
  maxColumns: number
  textService: TextService
  activeLine: string
  expandLineLinks?: boolean
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
}: ChapterViewLineProps): JSX.Element {
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
}: ChapterViewLineProps & { variant: LineVariantDisplay }): JSX.Element {
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

  const { lineGroup, transliteration } = useVariantTransliteration({
    chapter,
    line,
    variant,
    maxColumns,
    textService,
    activeLine,
    expandLineLinks,
    showOldLineNumbers,
    showMeter,
    showIpa,
  })
  const score = useMemo(
    () => (
      <CollapsibleRow show={showScore} id={scoreId} totalColumns={totalColumns}>
        <Score lineGroup={lineGroup} />
      </CollapsibleRow>
    ),
    [lineGroup, scoreId, showScore, totalColumns],
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
            parts={variant.note.parts}
          />
        </CollapsibleRow>
      ),
    [variant, noteId, showNotes, totalColumns],
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
    [variant, parallelsId, showParallels, totalColumns],
  )

  const toggleRow = (target: 'score' | 'notes' | 'parallels') => (): void =>
    dispatchRows({ type: 'toggle', target, row: lineIndex })

  return (
    <>
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
        <ToggleCell onToggle={toggleRow('score')}>
          {variant.isPrimaryVariant && (
            <ToggleIcon
              className={classNames({
                fas: true,
                'fa-caret-right': !showScore,
                'fa-caret-down': showScore,
              })}
              expanded={showScore}
              controls={scoreId}
              label="Show score"
            />
          )}
        </ToggleCell>
        {transliteration}
        <ToggleCell onToggle={toggleRow('notes')}>
          {variant.note && (
            <ToggleIcon
              className={classNames({
                fas: true,
                'fa-book': !showNotes,
                'fa-book-open': showNotes,
              })}
              expanded={showNotes}
              controls={noteId}
              label="Show notes"
            />
          )}
        </ToggleCell>
        <ToggleCell onToggle={toggleRow('parallels')}>
          {variant.parallelLines.length > 0 && (
            <ToggleIcon
              className={classNames({
                fas: true,
                'fa-quote-right': true,
              })}
              expanded={showParallels}
              controls={parallelsId}
              label="Show parallels"
            />
          )}
        </ToggleCell>
        {variant.isPrimaryVariant && (
          <Translation line={line} language={language} />
        )}
      </tr>
      {note}
      {parallels}
      {score}
    </>
  )
}
