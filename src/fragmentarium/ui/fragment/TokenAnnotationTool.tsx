import React, { Component } from 'react'
import { Fragment } from 'fragmentarium/domain/fragment'
import { AbstractLine } from 'transliteration/domain/abstract-line'
import { isEmptyLine, isTextLine } from 'transliteration/domain/type-guards'
import DisplayControlLine from 'transliteration/ui/DisplayControlLine'
import { TextLine } from 'transliteration/domain/text-line'
import { lineComponents } from 'transliteration/ui/TransliterationLines'
import { AnnotationLine } from 'transliteration/ui/annotation-line-tokens'
import './TokenAnnotationTool.sass'
import { Table } from 'react-bootstrap'

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
    return <AnnotationLine line={line} lineIndex={lineIndex} />
  }

  render(): JSX.Element {
    const text = this.fragment.text

    return (
      <Table className={'annotation-tool'}>
        <tbody>
          {text.allLines
            .filter((line) => !isEmptyLine(line))
            .map((line: AbstractLine, index) => {
              const LineComponent =
                lineComponents.get(line.type) || DisplayControlLine

              return (
                <React.Fragment key={index}>
                  {isTextLine(line) ? (
                    <>
                      <this.displayMarkableLine
                        key={index}
                        line={line}
                        lineIndex={index}
                      />
                      <tr className="line-separator"></tr>
                    </>
                  ) : (
                    <tr key={index}>
                      <LineComponent
                        line={line}
                        columns={text.numberOfColumns}
                      />
                    </tr>
                  )}
                </React.Fragment>
              )
            })}
        </tbody>
      </Table>
    )
  }
}
