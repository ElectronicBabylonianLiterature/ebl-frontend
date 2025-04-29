import classNames from 'classnames'
import React, { PropsWithChildren } from 'react'

export default function TransliterationTd({
  type,
  colSpan,
  rowSpan,
  children,
  className,
}: PropsWithChildren<{
  type: string
  colSpan?: number
  rowSpan?: number
  className?: string
}>): JSX.Element {
  return (
    <td
      className={classNames(`Transliteration__${type}`, className)}
      colSpan={colSpan}
      rowSpan={rowSpan}
    >
      {children}
    </td>
  )
}
