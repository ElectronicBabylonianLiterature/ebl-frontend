import React, { PropsWithChildren, useMemo, useState } from 'react'
import {
  ChapterDisplay,
  LineDisplay,
  LineVariantDisplay,
} from 'corpus/domain/chapter'
import { LineColumns } from 'transliteration/ui/line-tokens'
import TextService from 'corpus/application/TextService'
import { createColumns } from 'transliteration/domain/columns'
import { numberToUnicodeSubscript } from 'transliteration/application/SubIndex'
import LineNumber from 'corpus/ui/LineNumber'
import { LineGroup, LineInfo } from 'transliteration/ui/LineGroup'
import { AlignmentPopover } from 'transliteration/ui/AlignmentPopover'
import { Token } from 'transliteration/domain/token'
import { isBreak } from 'transliteration/domain/type-guards'

interface VariantTransliterationOptions {
  chapter: ChapterDisplay
  line: LineDisplay
  variant: LineVariantDisplay
  maxColumns: number
  textService: TextService
  activeLine: string
  expandLineLinks?: boolean
  showOldLineNumbers: boolean
  showMeter: boolean
  showIpa: boolean
}

function useVariantLineGroup(
  chapter: ChapterDisplay,
  line: LineDisplay,
  variant: LineVariantDisplay,
  textService: TextService,
): LineGroup {
  const [, highlightIndexSetter] = useState(0)
  return useMemo(() => {
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
}

export function useVariantTransliteration({
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
}: VariantTransliterationOptions): {
  lineGroup: LineGroup
  transliteration: JSX.Element
} {
  const columns = useMemo(
    () => createColumns(variant.reconstruction),
    [variant.reconstruction],
  )

  const lineGroup = useVariantLineGroup(chapter, line, variant, textService)

  const transliteration = useMemo(() => {
    const variantLabel = (
      <span className="chapter-display__variant">{`variant${numberToUnicodeSubscript(
        variant.originalIndex,
      )}:\xa0`}</span>
    )

    const ReconstructionTokenPopover = ({
      token,
      children,
    }: PropsWithChildren<{
      token: Token
    }>): JSX.Element => {
      return (
        <AlignmentPopover
          token={token}
          lineGroup={lineGroup}
          showMeter={showMeter}
          showIpa={showIpa}
        >
          {children}
        </AlignmentPopover>
      )
    }

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
          TokenActionWrapper={ReconstructionTokenPopover}
          conditionalBemModifiers={(token) =>
            isBreak(token) && !showMeter ? ['hidden'] : []
          }
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

  return { lineGroup, transliteration }
}
