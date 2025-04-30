import classNames from 'classnames'
import React, { PropsWithChildren } from 'react'

export default function TransliterationTd({
  type,
  colSpan,
  rowSpan,
  children,
  className,
  title,
}: PropsWithChildren<{
  type: string
  colSpan?: number
  rowSpan?: number
  className?: string
  title?: string
}>): JSX.Element {
  return (
    <td
      className={classNames(`Transliteration__${type}`, className)}
      colSpan={colSpan}
      rowSpan={rowSpan}
      title={title}
    >
      {children}
    </td>
  )
}
