import { ManuscriptLineDisplay } from 'corpus/domain/line-details'
import { LemmatizableToken, Token } from 'transliteration/domain/token'
import DictionaryWord from 'dictionary/domain/Word'
import { LineToken } from './line-tokens'
import { ChapterId } from 'transliteration/domain/chapter-id'
import TextService from 'corpus/application/TextService'

export class LineGroup {
  reconstruction: readonly LineToken[] = []
  manuscriptLines: LineToken[][] | null = null
  chapterId: ChapterId
  lineNumber: number
  variantNumber: number
  textService: TextService
  activeTokenIndex: number | null = null
  highlightIndexSetter

  constructor(
    reconstruction: readonly Token[] = [],
    chapterId: ChapterId,
    lineNumber: number,
    variantNumber: number,
    textService: TextService,
    highlightIndex: number,
    highlightIndexSetter: any
  ) {
    this.reconstruction = reconstruction.map(
      (token) => new LineToken(token as LemmatizableToken)
    )
    this.chapterId = chapterId
    this.lineNumber = lineNumber
    this.variantNumber = variantNumber
    this.textService = textService
    this.activeTokenIndex = highlightIndex
    this.highlightIndexSetter = highlightIndexSetter
  }

  public setManuscriptLines(manuscriptLines: ManuscriptLineDisplay[]): void {
    this.manuscriptLines = manuscriptLines.map((manuscriptLine) =>
      manuscriptLine.line.content.map(
        (token) => new LineToken(token as LemmatizableToken)
      )
    )
  }

  public setActiveTokenIndex(index: number | null): void {
    this.activeTokenIndex = index
    this.highlightIndexSetter(index)
  }

  public setReconstructionLemmas(lemmas: DictionaryWord[][]): void {
    this.reconstruction.map((token, index) => token.setLemma(lemmas[index]))
  }
}
