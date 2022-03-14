import React from 'react'
import { DollarLine } from 'transliteration/domain/dollar-lines'
import { AtLine } from 'transliteration/domain/at-lines'
import { LineProps } from './LineProps'
import TransliterationTd from './TransliterationTd'

export function DisplayDollarAndAtLine({
  line,
  columns,
}: LineProps): JSX.Element {
  const dollarAndAtLine = line as AtLine | DollarLine
  return (
    <>
      <td></td>
      <TransliterationTd colSpan={columns} type="DollarAndAtLine">
        {dollarAndAtLine.displayValue}
      </TransliterationTd>
    </>
  )
}
