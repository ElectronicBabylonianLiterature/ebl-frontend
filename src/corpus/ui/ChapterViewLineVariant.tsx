import React, { useContext, useMemo, useState } from 'react'
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
import { createColumns } from 'transliteration/domain/columns'
import { LineGroup, LineInfo } from 'transliteration/ui/LineGroup'
import renderVariantTransliteration from 'corpus/ui/ChapterViewVariantTransliteration'
import {
  CollapsibleRow,
  InterText,
  lineNumberColumns,
  toggleColumns,
  Translation,
  translationColumns,
} from 'corpus/ui/ChapterViewLineParts'
import {
  NotesToggle,
  ParallelsToggle,
  ScoreToggle,
} from 'corpus/ui/ChapterViewLineToggles'

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

  const columns = useMemo(
    () => createColumns(variant.reconstruction),
    [variant.reconstruction],
  )

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

  const transliteration = useMemo(
    () =>
      renderVariantTransliteration({
        chapterUrl: chapter.url,
        line,
        variantIndex: variant.originalIndex,
        isPrimaryVariant: variant.isPrimaryVariant,
        activeLine,
        showOldLineNumbers,
        expandLineLinks,
        columns,
        maxColumns,
        showMeter,
        showIpa,
        lineGroup,
      }),
    [
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
    ],
  )
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
        <ScoreToggle
          show={showScore}
          controls={scoreId}
          visible={variant.isPrimaryVariant}
          onToggle={() =>
            dispatchRows({ type: 'toggle', target: 'score', row: lineIndex })
          }
        />
        {transliteration}
        <NotesToggle
          show={showNotes}
          controls={noteId}
          visible={!!variant.note}
          onToggle={() =>
            dispatchRows({ type: 'toggle', target: 'notes', row: lineIndex })
          }
        />
        <ParallelsToggle
          show={showParallels}
          controls={parallelsId}
          visible={variant.parallelLines.length > 0}
          onToggle={() =>
            dispatchRows({
              type: 'toggle',
              target: 'parallels',
              row: lineIndex,
            })
          }
        />
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
