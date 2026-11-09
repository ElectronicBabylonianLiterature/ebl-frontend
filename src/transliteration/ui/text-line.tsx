import React, { useRef } from 'react'
import { Anchor, LineNumber } from 'transliteration/ui/line-number'
import { LineColumns } from 'transliteration/ui/line-tokens'
import { TextLine } from 'transliteration/domain/text-line'
import { LineProps } from 'transliteration/ui/LineProps'
import { lineNumberToAtf } from 'transliteration/domain/lineNumberToString'
import TransliterationTd from 'transliteration/ui/TransliterationTd'
import { Labels, labelsAbbreviation } from 'transliteration/domain/labels'
import { LemmaPopover } from 'transliteration/ui/WordInfo'
import { TokenActionWrapperProps } from 'transliteration/ui/LineAccumulator'
import NamedEntityPreviewToken from 'fragmentarium/ui/text-annotation/NamedEntityPreviewToken'
import useScrollToActiveLine from 'transliteration/ui/useScrollToActiveLine'

function LemmaPopoverWithNamedEntities({
  token,
  children,
}: TokenActionWrapperProps): JSX.Element {
  return (
    <NamedEntityPreviewToken token={token}>
      <LemmaPopover token={token}>{children}</LemmaPopover>
    </NamedEntityPreviewToken>
  )
}

export function createTextLineId(
  labels: Labels | undefined,
  textLine: TextLine,
): string {
  const label = labels ? `${labelsAbbreviation(labels)} ` : ''
  return `${label}${lineNumberToAtf(textLine.lineNumber)}`
}

export default function DisplayTextLine({
  line,
  columns,
  labels,
  activeLine = '',
  matchLegacyLineIds = false,
}: LineProps): JSX.Element {
  const textLine = line as TextLine
  const id = createTextLineId(labels, textLine)
  const legacyId =
    matchLegacyLineIds && labels?.sealNumber != null
      ? createTextLineId({ ...labels, sealNumber: null }, textLine)
      : undefined
  const lineRef = useRef<HTMLAnchorElement>(null)

  useScrollToActiveLine(lineRef, id, activeLine, legacyId)

  return (
    <>
      <TransliterationTd type={textLine.type}>
        <Anchor className="Transliteration__anchor" id={id} ref={lineRef}>
          <LineNumber line={textLine} />
        </Anchor>
      </TransliterationTd>
      <LineColumns
        columns={textLine.columns}
        maxColumns={columns}
        TokenActionWrapper={LemmaPopoverWithNamedEntities}
      />
    </>
  )
}
