import React from 'react'
import { AtLine, DollarLine } from 'transliteration/domain/line'
import { LineProps } from './LineProps'

export function DisplayDollarAndAtLineWithParenthesis({
  line,
  columns,
}: LineProps): JSX.Element {
  const dollarAndAtLine = line as AtLine | DollarLine
  return (
    <>
      <td></td>
      <td
        colSpan={columns}
        className="Transliteration__DollarAndAtLineWithParenthesis"
      >
        {dollarAndAtLine.displayValue}
      </td>
    </>
  )
}

export function DisplayDollarAndAtLine({
  line,
  columns,
}: LineProps): JSX.Element {
  const dollarAndAtLine = line as AtLine | DollarLine
  return (
    <>
      <td></td>
      <td colSpan={columns} className="Transliteration__DollarAndAtLine">
        ({dollarAndAtLine.displayValue})
      </td>
    </>
  )
}
