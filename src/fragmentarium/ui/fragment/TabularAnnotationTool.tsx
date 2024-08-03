import { Fragment } from 'fragmentarium/domain/fragment'
import React, { Component } from 'react'
import { isTextLine } from 'transliteration/domain/type-guards'
// import DisplayToken from 'transliteration/ui/DisplayToken'
import { Token } from 'transliteration/domain/token'
import _ from 'lodash'
import { TextLine } from 'transliteration/domain/text-line'
import { Table } from 'react-bootstrap'
import lineNumberToString from 'transliteration/domain/lineNumberToString'
import './TokenAnnotationTool.sass'
import DisplayToken from 'transliteration/ui/DisplayToken'
import { LineNumber, LineNumberRange } from 'transliteration/domain/line-number'
import { LemmaSearchForm } from '../LemmaSearchForm'
import WordService from 'dictionary/application/WordService'

type Props = {
  fragment: Fragment
  wordService: WordService
  onSave(fragment: Fragment): void
}

type AnnotationRow = {
  lineNumber: LineNumber | LineNumberRange
  lineIndex: number
  token: Token
  newUniqueLemma: string[]
  tokenIndex: number
  uniqueId: string
}

type AnnotationTable = AnnotationRow[]

export default class TokenAnnotationTool extends Component<Props, unknown> {
  private annotationTable: AnnotationTable
  fragment: Fragment

  constructor(props: Props) {
    super(props)
    this.fragment = props.fragment
    this.annotationTable = this.createAnnotationTable()
  }

  createAnnotationTable(): AnnotationTable {
    const lines = this.props.fragment.text.allLines

    return lines
      .map((line, lineIndex) => ({ line, lineIndex }))
      .filter((indexedLine) => isTextLine(indexedLine.line))
      .flatMap((indexedLine) => {
        const line = indexedLine.line as TextLine
        return line.content.map((token, tokenIndex) => ({
          lineNumber: line.lineNumber,
          token,
          tokenIndex,
          uniqueId: _.uniqueId(),
          lineIndex: indexedLine.lineIndex,
          newUniqueLemma: [],
        }))
      })
  }

  LemmaEditor({
    row,
    wordService,
  }: {
    row: AnnotationRow
    wordService: WordService
  }): JSX.Element {
    const lemmas = row.token.uniqueLemma || []
    return !row.token.lemmatizable ? (
      <></>
    ) : (
      <LemmaSearchForm
        wordService={wordService}
        lemmas={lemmas.join('+') || ''}
        onChange={() => () => console.log('something')}
        placeholder="Add lemma..."
      />
    )
  }

  render(): JSX.Element {
    let lastLineNumber = ''
    return (
      <Table
        bordered
        size={'sm'}
        className={'annotation-tool__table-annotator'}
      >
        <thead>
          <tr>
            <td>Line</td>
            <td>Token</td>
            <td>Lemma</td>
          </tr>
        </thead>
        <tbody>
          {this.annotationTable.map((row, index) => {
            const lineNumber = lineNumberToString(row.lineNumber)
            const displayRow = (
              <tr key={index}>
                <td>
                  {lineNumber !== lastLineNumber &&
                    `(${lineNumberToString(row.lineNumber)})`}
                </td>
                <td>
                  <DisplayToken token={row.token} isInPopover={true} />
                </td>
                <td>
                  <this.LemmaEditor
                    row={row}
                    wordService={this.props.wordService}
                  />
                </td>
              </tr>
            )
            lastLineNumber = lineNumber
            return displayRow
          })}
        </tbody>
      </Table>
    )
  }
}
