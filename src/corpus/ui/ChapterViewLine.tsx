import React from 'react'
import { ChapterDisplay, LineDisplay } from 'corpus/domain/chapter'
import { TextLineColumn } from 'transliteration/domain/columns'
import TextService from 'corpus/application/TextService'
import { ChapterViewLineVariant } from 'corpus/ui/ChapterViewLineVariant'

export { ChapterViewLineVariant }

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
