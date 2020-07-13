import _ from 'lodash'
import React from 'react'
import { RulingDollarLine } from 'transliteration/domain/dollar-lines'
import { LineProps } from './LineProps'

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
  columns,
}: LineProps): JSX.Element {
  const rulingLine = line as RulingDollarLine
  const rulingsNumber = rulingsToNumber.get(rulingLine.number) as number
  return (
    <>
      <td></td>
      <td colSpan={columns} className="Transliteration__RulingDollarLine">
        {_.range(0, rulingsNumber).map((number: number) => {
          return <Ruling key={number} />
        })}
      </td>
    </>
  )
}
