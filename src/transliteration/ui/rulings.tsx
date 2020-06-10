import _ from 'lodash'
import React from 'react'
import { Line, RulingDollarLine } from 'transliteration/domain/line'

function Ruling(): JSX.Element {
  return <div className="Transliteration__ruling" />
}

const rulingsToNumber: ReadonlyMap<string, number> = new Map([
  ['SINGLE', 1],
  ['DOUBLE', 2],
  ['TRIPLE', 3],
])

export default function DisplayRulingDollarLine({
  line,
}: {
  line: Line
}): JSX.Element {
  const rulingLine = line as RulingDollarLine
  const rulingsNumber = rulingsToNumber.get(rulingLine.number) as number
  return (
    <>
      <td></td>
      <td className="Transliteration__RulingDollarLine">
        {_.range(0, rulingsNumber).map((number: number) => {
          return <Ruling key={number} />
        })}
      </td>
    </>
  )
}
