import React from 'react'
import TextService from 'corpus/application/TextService'
import { ChapterId } from 'transliteration/domain/chapter-id'
import withData from 'http/withData'
import { LineDetails } from 'corpus/domain/line-details'

export const LineInfoContext = React.createContext<
  | {
      chapterId: ChapterId
      lineNumber: number
      variantNumber: number
      textService: TextService
    }
  | Record<string, never>
>({})

const AlignedManuscriptTokens = withData<
  Record<string, unknown>,
  {
    id: ChapterId
    lineNumber: number
    variantNumber: number
    textService: TextService
  },
  LineDetails
>(
  ({ data: line }): JSX.Element => {
    return (
      <ul>
        {line.manuscriptsOfVariant.map((manuscript, index) => (
          <li key={index}>{manuscript.siglum}</li>
        ))}
      </ul>
    )
  },
  ({ id, lineNumber, variantNumber, textService }) =>
    textService.findChapterLine(id, lineNumber, variantNumber)
)

export default AlignedManuscriptTokens
