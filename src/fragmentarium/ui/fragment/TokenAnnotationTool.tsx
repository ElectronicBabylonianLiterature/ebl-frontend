import React, { Component } from 'react'
import { Fragment } from 'fragmentarium/domain/fragment'
import { AbstractLine } from 'transliteration/domain/abstract-line'
import { isTextLine } from 'transliteration/domain/type-guards'
import DisplayControlLine from 'transliteration/ui/DisplayControlLine'
import { LineNumber } from 'transliteration/ui/line-number'
import { TextLine } from 'transliteration/domain/text-line'
import { AnnotationLineColumns } from 'transliteration/ui/line-tokens'
import { lineComponents } from 'transliteration/ui/TransliterationLines'

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
    numberOfColumns,
  }: {
    line: TextLine
    lineIndex: number
    numberOfColumns: number
  }): JSX.Element {
    return (
      <tr>
        <td>
          <LineNumber line={line} />
        </td>
        <AnnotationLineColumns
          lineIndex={lineIndex}
          columns={line.columns}
          maxColumns={numberOfColumns}
        />
      </tr>
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
                    numberOfColumns={text.numberOfColumns}
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
