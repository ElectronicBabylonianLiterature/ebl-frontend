import React, { PropsWithChildren } from 'react'
import { Collapse } from 'react-bootstrap'
import { LineDisplay, LineVariantDisplay } from 'corpus/domain/chapter'
import Markup from 'transliteration/ui/markup'
import lineNumberToString from 'transliteration/domain/lineNumberToString'

export const lineNumberColumns = 1
export const toggleColumns = 3
export const translationColumns = lineNumberColumns + 1

export function InterText({
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

export function Translation({
  line,
  language,
}: {
  line: LineDisplay
  language: string
}): JSX.Element {
  const translation = line.translation.filter(
    (translation) => translation.language === language,
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

export function CollapsibleRow({
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
