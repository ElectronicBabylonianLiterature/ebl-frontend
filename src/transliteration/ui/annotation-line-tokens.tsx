import React from 'react'
import { TextLineColumn } from 'transliteration/domain/columns'
import { TextLine } from 'transliteration/domain/text-line'
import { LineNumber } from './line-number'
import { isCloseEnclosure, isOpenEnclosure } from './LineAccumulator'
import './annotation-line-tokens.sass'
import { isLeftSide, Protocol } from 'transliteration/domain/token'
import { MarkableToken } from './MarkableToken'

function createTokenMarkables(
  columns: readonly TextLineColumn[]
): MarkableToken[] {
  let language = 'AKKADIAN'
  let isInGloss = false
  let protocol: Protocol | null = null
  let enclosureIsOpen = false
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
            language,
            index !== 0 && !isCloseEnclosure(token) && !enclosureIsOpen
          )
          enclosureIsOpen = isOpenEnclosure(token)
          markables.push(markable)
      }
    })
  )
  return markables
}

export function AnnotationLineColumns({
  line,
  lineIndex,
}: {
  line: TextLine
  lineIndex: number
}): JSX.Element {
  const markables = createTokenMarkables(line.columns)

  const sourceTextLine = (
    <tr className={'annotation-line__source'}>
      <td>
        <LineNumber line={line} />
      </td>
      {markables.map((token, index) => {
        return (
          <td key={index}>
            <span
              className={'source-token'}
              onClick={() =>
                console.log(
                  `display token ${token.token.cleanValue} at ` +
                    `line=${lineIndex}, index in array=${index}, token index = ${token.index}`,
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
    <tr className={'annotation-line__annotation-layer'}>
      <td></td>
      {markables.map((token, index) => {
        return (
          <td key={index}>
            <span
              className={'markable-token'}
              onClick={() =>
                console.log(
                  `lemma of token ${token.token.cleanValue} at line=${lineIndex}, index=${index}`,
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
