import { TextLine } from 'transliteration/domain/text-line'
import React, { forwardRef, PropsWithChildren } from 'react'
import lineNumberToString from 'transliteration/domain/lineNumberToString'

export function LineNumber({ line }: { line: TextLine }): JSX.Element {
  return <sup>({lineNumberToString(line.lineNumber)})</sup>
}

export const Anchor = forwardRef<
  HTMLAnchorElement,
  PropsWithChildren<{ id: string; className: string }>
>(function Anchor({ id, children, className }, ref): JSX.Element {
  return (
    <a className={className} id={id} href={`#${id}`} ref={ref}>
      {children}
    </a>
  )
})
