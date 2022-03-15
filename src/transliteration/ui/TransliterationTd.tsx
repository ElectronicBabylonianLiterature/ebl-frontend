import React, { PropsWithChildren } from 'react'

export default function TransliterationTd({
  type,
  colSpan,
  children,
}: PropsWithChildren<{
  type: string
  colSpan?: number
}>): JSX.Element {
  return (
    <td className={`Transliteration__${type}`} colSpan={colSpan}>
      {children}
    </td>
  )
}
