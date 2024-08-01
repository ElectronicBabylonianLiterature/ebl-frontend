import React from 'react'
import { TextLineColumn } from 'transliteration/domain/columns'
import { TextLine } from 'transliteration/domain/text-line'
import { isLeftSide, Protocol } from 'transliteration/domain/token'
import { MarkableToken } from './MarkableToken'
import { Form } from 'react-bootstrap'
import lineNumberToString from 'transliteration/domain/lineNumberToString'

function createTokenMarkables(
  columns: readonly TextLineColumn[]
): MarkableToken[] {
  let language = 'AKKADIAN'
  let isInGloss = false
  let protocol: Protocol | null = null
  let markable: MarkableToken

  const markables: MarkableToken[] = []

  columns.forEach((column) =>
    column.content.forEach((token, index) => {
      switch (token.type) {
        case 'LanguageShift':
          language = token.language
          break
        case 'CommentaryProtocol':
          protocol = token.value
          break
        case 'DocumentOrientedGloss':
          isInGloss = isLeftSide(token)
          break
        case 'Column':
          throw new Error('Unexpected column token.')
        default:
          markable = new MarkableToken(
            token,
            index,
            isInGloss,
            protocol,
            language
          )
          markables.push(markable)
      }
    })
  )
  return markables
}

function DisplayMarkable({
  markable,
}: {
  markable: MarkableToken
}): JSX.Element {
  return (
    <>
      <span className={'source-token'}>{markable.display()}</span>
    </>
  )
}

export function AnnotationLine({
  line,
  lineIndex,
}: {
  line: TextLine
  lineIndex: number
}): JSX.Element {
  const markables = createTokenMarkables(line.columns)

  const checkbox = <Form.Check type={'checkbox'} />

  return (
    <>
      <tr>
        <td>{checkbox}</td>
        <td>({lineNumberToString(line.lineNumber)})</td>
        <td></td>
      </tr>
      {markables.map((markable, index) => {
        return (
          <tr key={index}>
            <td>{checkbox}</td>
            <td>
              <DisplayMarkable markable={markable} />
            </td>
            <td>{markable.lemma}</td>
          </tr>
        )
      })}
    </>
  )
}
