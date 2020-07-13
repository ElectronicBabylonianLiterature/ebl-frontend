import React from 'react'
import { DollarLine } from 'transliteration/domain/dollar-lines'
import { AtLine } from 'transliteration/domain/at-lines'
import { LineProps } from './LineProps'

export function DisplayDollarAndAtLine({
  line,
  columns,
}: LineProps): JSX.Element {
  const dollarAndAtLine = line as AtLine | DollarLine
  return (
    <>
      <td></td>
      <td colSpan={columns} className="Transliteration__DollarAndAtLine">
        {dollarAndAtLine.displayValue}
      </td>
    </>
  )
}
