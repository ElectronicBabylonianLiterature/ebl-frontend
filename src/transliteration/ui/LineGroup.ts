import { ManuscriptLineDisplay } from 'corpus/domain/line-details'
import { LemmatizableToken, Token } from 'transliteration/domain/token'
import DictionaryWord from 'dictionary/domain/Word'
import { LineToken } from './line-tokens'
import { ChapterId } from 'transliteration/domain/chapter-id'
import TextService from 'corpus/application/TextService'

export class LineGroup {
  reconstruction: readonly LineToken[] = []
  manuscriptLines: LineToken[][] | null = null
  chapterId: ChapterId | null = null
  lineNumber: number | null = null
  variantNumber: number | null = null
  textService: TextService | null = null
  activeTokenIndex: number | null = null

  constructor(
    reconstruction: readonly Token[] = [],
    chapterId: ChapterId | null = null,
    lineNumber: number | null = null,
    variantNumber: number | null = null,
    textService: TextService | null = null
  ) {
    this.reconstruction = reconstruction.map(
      (token) => new LineToken(token as LemmatizableToken)
    )
    this.chapterId = chapterId
    this.lineNumber = lineNumber
    this.variantNumber = variantNumber
    this.textService = textService
    this.activeTokenIndex = null

    console.log('building LineGroup')
  }

  public setManuscriptLines(manuscriptLines: ManuscriptLineDisplay[]): void {
    this.manuscriptLines = manuscriptLines.map((manuscriptLine) =>
      manuscriptLine.line.content.map(
        (token) => new LineToken(token as LemmatizableToken)
      )
    )
  }

  public setReconstructionLemmas(lemmas: DictionaryWord[][]): void {
    this.reconstruction.map((token, index) => token.setLemma(lemmas[index]))
  }
}
