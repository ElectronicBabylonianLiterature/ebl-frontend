import React from 'react'
import TextService from 'corpus/application/TextService'
import { ChapterId } from 'transliteration/domain/chapter-id'
import withData from 'http/withData'
import { LineDetails, ManuscriptLineDisplay } from 'corpus/domain/line-details'
import _ from 'lodash'
import { LemmatizableToken, Token } from 'transliteration/domain/token'
import DisplayToken from 'transliteration/ui/DisplayToken'
import { numberToUnicodeSubscript } from 'transliteration/application/SubIndex'
import WordService from 'dictionary/application/WordService'
import DictionaryWord from 'dictionary/domain/Word'
import { WordItem } from 'transliteration/ui/WordInfo'
import Bluebird from 'bluebird'

export const LineInfoContext = React.createContext<
  | {
      chapterId: ChapterId
      lineNumber: number
      variantNumber: number
      textService: TextService
    }
  | Record<string, never>
>({})

export interface AlignedTokenRow {
  token: LemmatizableToken
  sigla: string[]
  variantNumber: number | null
}

export function createAlignmentMap(
  manuscripts: ManuscriptLineDisplay[],
  tokenIndex: number | undefined
): Map<string, AlignedTokenRow> {
  const map = new Map<string, AlignedTokenRow>()

  if (_.isNull(tokenIndex)) {
    return map
  }

  for (const [index, manuscript] of manuscripts.entries()) {
    const alignedTokens = manuscript.line.content.filter(
      (token) => _.isNumber(token.alignment) && token.alignment === tokenIndex
    )

    let variantNumber: number | null = null

    for (const token of alignedTokens) {
      const word = token as LemmatizableToken
      if (_.isNull(variantNumber)) {
        if (word.variant) {
          variantNumber = index
        }
      }
      const currentSigla = map.get(word.value)?.sigla || []
      map.set(word.value, {
        token: word,
        sigla: [...currentSigla, manuscript.siglum],
        variantNumber: variantNumber,
      })
    }
  }

  return map
}

const Info = withData<
  { linePrefix: string },
  { word: LemmatizableToken; dictionary: WordService },
  DictionaryWord[]
>(
  ({ data, linePrefix }) => (
    <ol className="word-info__words">
      {data.map((word, index) => (
        <WordItem key={index} word={word} linePrefix={linePrefix} />
      ))}
    </ol>
  ),
  ({ word, dictionary }) =>
    Bluebird.all(word.uniqueLemma.map((lemma) => dictionary.find(lemma)))
)

export default withData<
  { tokenIndex?: number; variantNumber: number; dictionary: WordService },
  {
    id: ChapterId
    lineNumber: number
    variantNumber: number
    textService: TextService
  },
  LineDetails
>(
  ({ data: line, tokenIndex, dictionary }): JSX.Element => {
    const alignmentMap = createAlignmentMap(
      line.manuscriptsOfVariant,
      tokenIndex
    )

    return (
      <table>
        <tbody>
          {[...alignmentMap.values()].map(
            ({ token, sigla, variantNumber }, index) => (
              <React.Fragment key={index}>
                {variantNumber && (
                  <tr className="word-info__words">
                    <td colSpan={2}>
                      <Info
                        word={token}
                        dictionary={dictionary}
                        linePrefix={`Variant${numberToUnicodeSubscript(
                          variantNumber
                        )}: `}
                      />
                    </td>
                  </tr>
                )}
                <tr className="word-info__words">
                  <td>
                    <DisplayToken token={token as Token} showPopover={false} />
                    &nbsp;
                  </td>
                  <td>{sigla.join(', ')}</td>
                </tr>
              </React.Fragment>
            )
          )}
        </tbody>
      </table>
    )
  },
  ({ id, lineNumber, variantNumber, textService }) =>
    textService.findChapterLine(id, lineNumber, variantNumber)
)
