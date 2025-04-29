import React, { PropsWithChildren } from 'react'

export default function TransliterationTd({
  type,
  colSpan,
  rowSpan,
  children,
}: PropsWithChildren<{
  type: string
  colSpan?: number
  rowSpan?: number
}>): JSX.Element {
  return (
    <td
      className={`Transliteration__${type}`}
      colSpan={colSpan}
      rowSpan={rowSpan}
    >
      {children}
    </td>
  )
}
