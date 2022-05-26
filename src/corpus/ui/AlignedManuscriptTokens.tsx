import React from 'react'
import TextService from 'corpus/application/TextService'
import { ChapterId } from 'transliteration/domain/chapter-id'
import withData from 'http/withData'
import { LineDetails } from 'corpus/domain/line-details'
import DisplayToken from 'transliteration/ui/DisplayToken'

export const LineInfoContext = React.createContext<
  | {
      chapterId: ChapterId
      lineNumber: number
      variantNumber: number
      textService: TextService
    }
  | Record<string, never>
>({})

export default withData<
  // Record<string, unknown>,
  { tokenIndex?: number },
  {
    id: ChapterId
    lineNumber: number
    variantNumber: number
    textService: TextService
  },
  LineDetails
>(
  ({ data: line, tokenIndex }): JSX.Element => {
    return (
      <ol className="word-info__words">
        {line.manuscriptsOfVariant.map((manuscript, index) => {
          const alignedTokens = manuscript.line.content.filter(
            (token) => token.alignment === tokenIndex
          )
          return (
            alignedTokens && (
              <li key={index}>
                {alignedTokens.map((token, index) => (
                  <DisplayToken key={index} token={token} />
                ))}
                &nbsp;
                {manuscript.siglum}
              </li>
            )
          )
        })}
      </ol>
    )
  },
  ({ id, lineNumber, variantNumber, textService }) =>
    textService.findChapterLine(id, lineNumber, variantNumber)
)
