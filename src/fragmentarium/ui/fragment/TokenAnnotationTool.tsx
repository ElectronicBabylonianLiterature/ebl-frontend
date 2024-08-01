import React, { Component } from 'react'
import { Fragment } from 'fragmentarium/domain/fragment'
import { AbstractLine } from 'transliteration/domain/abstract-line'
import { isTextLine } from 'transliteration/domain/type-guards'
import DisplayControlLine from 'transliteration/ui/DisplayControlLine'
import { TextLine } from 'transliteration/domain/text-line'
import { lineComponents } from 'transliteration/ui/TransliterationLines'
import { AnnotationLineColumns } from 'transliteration/ui/annotation-line-tokens'

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
    return <AnnotationLineColumns line={line} lineIndex={lineIndex} />
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
