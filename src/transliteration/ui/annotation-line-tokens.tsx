import React from 'react'
import { TextLineColumn } from 'transliteration/domain/columns'
import { TextLine } from 'transliteration/domain/text-line'
import { LineNumber } from './line-number'
import { isCloseEnclosure, isOpenEnclosure } from './LineAccumulator'
import { isLeftSide, Protocol } from 'transliteration/domain/token'
import { MarkableToken } from './MarkableToken'
import _ from 'lodash'

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
      const nextToken = column.content[index + 1] || null
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
          enclosureIsOpen = isOpenEnclosure(token)
          markable = new MarkableToken(
            token,
            index,
            isInGloss,
            protocol,
            language,
            nextToken && !isCloseEnclosure(nextToken) && !enclosureIsOpen
          )
          markables.push(markable)
      }
    })
  )
  return markables
}

export function AnnotationLine({
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
      {markables.map((markable, index) => {
        return (
          <td key={index}>
            <span
              className={'source-token'}
              onClick={() => console.log(markable)}
            >
              {markable.display()}
            </span>
            {markable.hasTrailingWhitespace && <>&nbsp;&nbsp;</>}
          </td>
        )
      })}
    </tr>
  )
  const lemmaAnnotationLayer = _.some(
    markables,
    (markable) => markable.token.lemmatizable
  ) ? (
    <tr className={'annotation-line__annotation-layer'}>
      <td></td>
      {markables.map((markable, index) => {
        const token = markable.token
        return token.lemmatizable ? (
          <td key={index}>
            <span
              className={'markable-token'}
              onClick={() => console.log(markable)}
            >
              {_.isEmpty(token.uniqueLemma) ? '➕' : token.uniqueLemma}
            </span>
            {markable.hasTrailingWhitespace && <>&nbsp;&nbsp;</>}
          </td>
        ) : (
          <td key={index}></td>
        )
      })}
    </tr>
  ) : (
    <></>
  )

  return (
    <>
      {sourceTextLine}
      {lemmaAnnotationLayer}
    </>
  )
}
