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

export default class TokenAnnotationTool extends Component<Props, any> {
  readonly fragment: Fragment
  constructor(props: Props) {
    super(props)
    this.fragment = props.fragment
  }

  markableLine({
    line,
    numberOfColumns,
  }: {
    line: TextLine
    numberOfColumns: number
  }): JSX.Element {
    return (
      <tr>
        <td>
          <LineNumber line={line} />
        </td>
        <AnnotationLineColumns
          columns={line.columns}
          maxColumns={numberOfColumns}
        />
      </tr>
    )
  }

  render(): JSX.Element {
    const text = this.fragment.text
    return (
      <table>
        <tbody>
          {text.allLines.map((line: AbstractLine, index) => {
            if (isTextLine(line)) {
              return (
                <this.markableLine
                  key={index}
                  line={line}
                  numberOfColumns={text.numberOfColumns}
                />
              )
            }
            const LineComponent =
              lineComponents.get(line.type) || DisplayControlLine
            return (
              <tr key={index}>
                <LineComponent line={line} columns={text.numberOfColumns} />
              </tr>
            )
          })}
        </tbody>
      </table>
    )
  }
}
