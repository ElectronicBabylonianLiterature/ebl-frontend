import React from 'react'
import TextService from 'corpus/application/TextService'
import { ChapterId } from 'transliteration/domain/chapter-id'
import withData from 'http/withData'
import { LineDetails, ManuscriptLineDisplay } from 'corpus/domain/line-details'
import _ from 'lodash'
import { Token } from 'transliteration/domain/token'
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

interface AlignedTokenRow {
  token: Token
  sigla: string[]
}

const createAlignmentMap = (
  manuscripts: ManuscriptLineDisplay[],
  tokenIndex: number | undefined
): Map<string, AlignedTokenRow> => {
  const map = new Map<string, AlignedTokenRow>()

  if (_.isNull(tokenIndex)) {
    return map
  }

  for (const manuscript of manuscripts) {
    const alignedTokens = manuscript.line.content.filter(
      (token) => _.isNumber(token.alignment) && token.alignment === tokenIndex
    )

    for (const token of alignedTokens) {
      const currentSigla = map.get(token.value)?.sigla || []
      map.set(token.value, {
        token: token,
        sigla: [...currentSigla, manuscript.siglum],
      })
    }
  }

  return map
}

export default withData<
  { tokenIndex?: number; variantNumber: number },
  {
    id: ChapterId
    lineNumber: number
    variantNumber: number
    textService: TextService
  },
  LineDetails
>(
  ({ data: line, tokenIndex }): JSX.Element => {
    const alignmentMap = createAlignmentMap(
      line.manuscriptsOfVariant,
      tokenIndex
    )

    return (
      <>
        {[...alignmentMap.values()].map(({ token, sigla }, index) => (
          <tr key={index} className="word-info__words">
            <td>
              <DisplayToken token={token} />
              &nbsp;
            </td>
            <td>{sigla.join(', ')}</td>
          </tr>
        ))}
      </>
    )
  },
  ({ id, lineNumber, variantNumber, textService }) =>
    textService.findChapterLine(id, lineNumber, variantNumber),
  {
    watch: (props) => [
      props.id,
      props.lineNumber,
      props.variantNumber,
      props.textService,
    ],
    filter: (props) => props.variantNumber === 0,
    defaultData: new LineDetails([], 0),
  }
)
