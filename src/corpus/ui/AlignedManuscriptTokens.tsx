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
import Bluebird from 'bluebird'
import { WordItem } from 'transliteration/ui/WordInfo'

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
  isVariant: boolean
}

export function createAlignmentMap(
  manuscripts: ManuscriptLineDisplay[],
  tokenIndex: number | undefined
): Map<string, AlignedTokenRow> {
  const map = new Map<string, AlignedTokenRow>()

  if (_.isNull(tokenIndex)) {
    return map
  }

  for (const manuscript of manuscripts) {
    const alignedTokens = manuscript.line.content.filter(
      (token) => _.isNumber(token.alignment) && token.alignment === tokenIndex
    )

    let isVariant = false

    for (const token of alignedTokens) {
      const word = token as LemmatizableToken

      if (word.variant) {
        isVariant = true
      }

      const currentSigla = map.get(word.value)?.sigla || []
      map.set(word.value, {
        token: word,
        sigla: [...currentSigla, manuscript.siglum],
        isVariant: isVariant,
      })
    }
  }

  return map
}

function VariantHeader({
  variantNumber,
}: {
  variantNumber: number
}): JSX.Element {
  return <span>{`Variant${numberToUnicodeSubscript(variantNumber)}:`}</span>
}

const VariantItem = withData<
  Record<string, unknown>,
  { token: LemmatizableToken; dictionary: WordService },
  DictionaryWord[]
>(
  ({ data }): JSX.Element => (
    <ol className="word-info__words">
      {data.map((dictionaryWord, index) => (
        <WordItem key={index} word={dictionaryWord} />
      ))}
    </ol>
  ),
  ({ token, dictionary }) =>
    Bluebird.all(token.uniqueLemma.map((lemma) => dictionary.find(lemma)))
)

function TokenWithSigla({
  token,
  sigla,
  cssClass = '',
}: {
  token: LemmatizableToken
  sigla: string[]
  cssClass?: string
}): JSX.Element {
  return (
    <tr className="word-info__words">
      <td className={cssClass}>
        <DisplayToken token={token as Token} showPopover={false} />
        &nbsp;
      </td>
      <td className="word-info__variant-token">{sigla.join(', ')}</td>
    </tr>
  )
}

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
    const alignedTokens = [...alignmentMap].sort((a, b) =>
      !a[1].isVariant && b[1].isVariant ? -1 : 0
    )
    let variantNum = 1
    return (
      <table className="aligned-tokens">
        <tbody>
          {alignedTokens.map(([, { token, sigla, isVariant }], index) => {
            return isVariant ? (
              <React.Fragment key={index}>
                <tr className="word-info__words">
                  <td colSpan={2} className="word-info__variant-heading">
                    <VariantHeader variantNumber={variantNum++} />
                  </td>
                </tr>
                <TokenWithSigla
                  token={token}
                  sigla={sigla}
                  cssClass="word-info__variant-token"
                />
                <tr className="word-info__words">
                  <td className="word-info__variant-token">
                    <VariantItem token={token} dictionary={dictionary} />
                  </td>
                </tr>
              </React.Fragment>
            ) : (
              <TokenWithSigla token={token} sigla={sigla} key={index} />
            )
          })}
        </tbody>
      </table>
    )
  },
  ({ id, lineNumber, variantNumber, textService }) =>
    textService.findChapterLine(id, lineNumber, variantNumber)
)
