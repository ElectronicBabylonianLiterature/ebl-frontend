import React from 'react'
import { LineProps } from './LineProps'
import TransliterationTd from './TransliterationTd'

export default function DisplayControlLine({
  line: { type, prefix, content },
  columns,
}: LineProps): JSX.Element {
  return (
    <>
      <TransliterationTd type={type}>{prefix}</TransliterationTd>
      <TransliterationTd colSpan={columns} type={type}>
        {content.map(({ value }) => value).join('')}
      </TransliterationTd>
    </>
  )
}
