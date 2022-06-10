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
import { fetchLemma, WordItem } from 'transliteration/ui/WordInfo'

export const LineInfoContext = React.createContext<
  | {
      chapterId: ChapterId
      lineNumber: number
      variantNumber: number
      textService: TextService
    }
  | Record<string, never>
>({})

export class AlignmentLineDisplay {
  sigla: string[]

  constructor(readonly token: LemmatizableToken, siglum: string) {
    this.token = token
    this.sigla = [siglum]
  }

  get isVariantLine(): boolean {
    return !_.isNil(this.token.variant)
  }

  public pushSiglum(siglum: string): void {
    this.sigla.push(siglum)
  }
}

export function createAlignmentMap(
  manuscripts: ManuscriptLineDisplay[],
  alignIndex: number
): Map<string, AlignmentLineDisplay> {
  const alignmentMap = new Map<string, AlignmentLineDisplay>()

  for (const manuscript of manuscripts) {
    for (const token of manuscript.getAlignedTokens(alignIndex)) {
      const key = token.value
      const siglum = manuscript.siglum

      alignmentMap.has(key)
        ? alignmentMap.get(key)?.pushSiglum(siglum)
        : alignmentMap.set(
            key,
            new AlignmentLineDisplay(token as LemmatizableToken, siglum)
          )
    }
  }
  return alignmentMap
}

function VariantHeader({
  variantNumber,
}: {
  variantNumber: number
}): JSX.Element {
  return (
    <tr className="word-info__words">
      <td colSpan={2} className="word-info__variant-heading">
        <span>{`Variant${numberToUnicodeSubscript(variantNumber)}:`}</span>
      </td>
    </tr>
  )
}

const VariantInfo = withData<
  unknown,
  { word: LemmatizableToken; dictionary: WordService },
  DictionaryWord[]
>(
  ({ data }) => (
    <tr className="word-info__words">
      <td className="word-info__variant-token">
        <ol className="word-info__words">
          {data.map((word, index) => (
            <WordItem key={index} word={word} />
          ))}
        </ol>
      </td>
    </tr>
  ),
  fetchLemma
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
        <DisplayToken token={token as Token} />
        &nbsp;
      </td>
      <td className="word-info__variant-token">{sigla.join(', ')}</td>
    </tr>
  )
}

export default withData<
  { alignIndex: number; variantNumber: number; dictionary: WordService },
  {
    id: ChapterId
    lineNumber: number
    variantNumber: number
    textService: TextService
  },
  LineDetails
>(
  ({ data: line, alignIndex, dictionary }): JSX.Element => {
    const alignmentMap = createAlignmentMap(
      line.manuscriptsOfVariant,
      alignIndex
    )
    const alignedTokens = [...alignmentMap].sort((a, b) =>
      !a[1].isVariantLine && b[1].isVariantLine ? -1 : 0
    )
    let variantNum = 1
    return (
      <table className="aligned-tokens">
        <tbody>
          {alignedTokens.map(([, { token, sigla, isVariantLine }], index) => {
            return isVariantLine ? (
              <React.Fragment key={index}>
                <VariantHeader variantNumber={variantNum++} />
                <TokenWithSigla
                  token={token}
                  sigla={sigla}
                  cssClass="word-info__variant-token"
                />
                <VariantInfo word={token} dictionary={dictionary} />
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
