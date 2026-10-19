import React, { PropsWithChildren } from 'react'
import { LineDisplay } from 'corpus/domain/chapter'
import { TextLineColumn } from 'transliteration/domain/columns'
import { LineColumns } from 'transliteration/ui/line-tokens'
import { numberToUnicodeSubscript } from 'transliteration/application/SubIndex'
import LineNumber from 'corpus/ui/LineNumber'
import { LineGroup } from 'transliteration/ui/LineGroup'
import { AlignmentPopover } from 'transliteration/ui/AlignmentPopover'
import { Token } from 'transliteration/domain/token'
import { isBreak } from 'transliteration/domain/type-guards'

export default function renderVariantTransliteration({
  chapterUrl,
  line,
  variantIndex,
  isPrimaryVariant,
  activeLine,
  showOldLineNumbers,
  expandLineLinks,
  columns,
  maxColumns,
  showMeter,
  showIpa,
  lineGroup,
}: {
  chapterUrl: string
  line: LineDisplay
  variantIndex: number
  isPrimaryVariant: boolean
  activeLine: string
  showOldLineNumbers: boolean
  expandLineLinks?: boolean
  columns: readonly TextLineColumn[]
  maxColumns: number
  showMeter: boolean
  showIpa: boolean
  lineGroup: LineGroup
}): JSX.Element {
  const variantLabel = (
    <span className="chapter-display__variant">{`variant${numberToUnicodeSubscript(
      variantIndex,
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
      {isPrimaryVariant ? (
        <LineNumber
          line={line}
          activeLine={activeLine}
          showOldLineNumbers={showOldLineNumbers}
          url={expandLineLinks ? chapterUrl : null}
        >
          {variantIndex > 0 && variantLabel}
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
}
