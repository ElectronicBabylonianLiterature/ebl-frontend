import React, { Component } from 'react'
import { Fragment } from 'fragmentarium/domain/fragment'
import { AbstractLine } from 'transliteration/domain/abstract-line'
import { isTextLine } from 'transliteration/domain/type-guards'
import DisplayControlLine from 'transliteration/ui/DisplayControlLine'
import { TextLine } from 'transliteration/domain/text-line'
import { lineComponents } from 'transliteration/ui/TransliterationLines'
import {
  annotationLineAccFromColumns,
  TextLineColumn,
} from 'transliteration/domain/columns'
import { LineNumber } from 'transliteration/ui/line-number'

function AnnotationLineColumns({
  line,
  lineIndex,
  columns,
}: {
  line: TextLine
  lineIndex: number
  columns: readonly TextLineColumn[]
}): JSX.Element {
  const lineAccumulator = annotationLineAccFromColumns(columns)

  return (
    <>
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
    </>
  )
}

type Props = {
  fragment: Fragment
  onSave(fragment: Fragment): void
}

export default class TokenAnnotationTool extends Component<Props> {
  readonly fragment: Fragment

  constructor(props: Props) {
    super(props)
    this.fragment = props.fragment
  }

  displayMarkableLine({
    line,
    lineIndex,
  }: {
    line: TextLine
    lineIndex: number
  }): JSX.Element {
    return (
      <AnnotationLineColumns
        line={line}
        lineIndex={lineIndex}
        columns={line.columns}
      />
    )
  }

  render(): JSX.Element {
    const text = this.fragment.text

    return (
      <>
        {text.allLines.map((line: AbstractLine, index) => {
          const LineComponent =
            lineComponents.get(line.type) || DisplayControlLine

          return (
            <table key={index}>
              <tbody>
                {isTextLine(line) ? (
                  <this.displayMarkableLine
                    key={index}
                    line={line}
                    lineIndex={index}
                  />
                ) : (
                  <tr key={index}>
                    <LineComponent line={line} columns={text.numberOfColumns} />
                  </tr>
                )}
              </tbody>
            </table>
          )
        })}
      </>
    )
  }
}
