import React from 'react'
import { DollarAndAtLine, Line } from 'transliteration/domain/line'

export function DisplayDollarAndAtLineWithParenthesis({
  line,
}: {
  line: Line
}): JSX.Element {
  const dollarAndAtLine = line as DollarAndAtLine
  return (
    <>
      <td></td>
      <td className="Transliteration__DollarAndAtLineWithParenthesis">
        {dollarAndAtLine.displayValue}
      </td>
    </>
  )
}

export function DisplayDollarAndAtLine({ line }: { line: Line }): JSX.Element {
  const dollarAndAtLine = line as DollarAndAtLine
  return (
    <>
      <td></td>
      <td className="Transliteration__DollarAndAtLine">
        (${dollarAndAtLine.displayValue})
      </td>
    </>
  )
}
