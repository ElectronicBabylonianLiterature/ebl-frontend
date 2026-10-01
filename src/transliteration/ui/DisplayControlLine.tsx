import React from 'react'
import { LineProps } from 'transliteration/ui/LineProps'
import TransliterationTd from 'transliteration/ui/TransliterationTd'

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
