import React from 'react'
import {
  annotationLineAccFromColumns,
  TextLineColumn,
} from 'transliteration/domain/columns'
import { TextLine } from 'transliteration/domain/text-line'
import { LineNumber } from './line-number'

export function AnnotationLineColumns({
  line,
  lineIndex,
  columns,
  maxColumns,
}: {
  line: TextLine
  lineIndex: number
  columns: readonly TextLineColumn[]
  maxColumns: number
}): JSX.Element {
  const lineAccumulator = annotationLineAccFromColumns(columns)

  const sourceTextLine = (
    <tr className={'annotation-line__source'}>
      <td>
        <LineNumber line={line} />
      </td>
      {lineAccumulator.flatResult.map((token, index) => {
        return (
          <td key={index}>
            <span
              onClick={() =>
                console.log(
                  `clicked on token ${token.token.cleanValue} at line=${lineIndex}, index=${index}`,
                  token.token
                )
              }
            >
              {token.display()}
            </span>
          </td>
        )
      })}
    </tr>
  )
  const lemmaAnnotationLayer = (
    <tr className={'annotation-line__lemmatization'}>
      <td></td>
      {lineAccumulator.flatResult.map((token, index) => {
        return (
          <td key={index}>
            <span
              onClick={() =>
                console.log(
                  `clicked on lemma of token ${token.token.cleanValue} at line=${lineIndex}, index=${index}`,
                  token.token
                )
              }
            >
              {token.token.uniqueLemma}
            </span>
          </td>
        )
      })}
    </tr>
  )

  return (
    <>
      {sourceTextLine}
      {lemmaAnnotationLayer}
    </>
  )
}
