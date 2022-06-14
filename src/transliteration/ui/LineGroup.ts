import { LineDetails, ManuscriptLineDisplay } from 'corpus/domain/line-details'
import { LemmatizableToken, Token } from 'transliteration/domain/token'
import DictionaryWord from 'dictionary/domain/Word'
import { LineToken } from './line-tokens'
import { ChapterId } from 'transliteration/domain/chapter-id'
import TextService from 'corpus/application/TextService'
import Bluebird from 'bluebird'

export interface LineInfo {
  chapterId: ChapterId
  lineNumber: number
  variantNumber: number
  textService: TextService
}

export class LineGroup {
  reconstruction: readonly LineToken[] = []
  manuscriptLines: LineToken[][] | null = null
  activeTokenIndex: number | null = null
  highlightIndexSetter
  lineInfo: LineInfo
  findChapterLine: () => Bluebird<LineDetails>

  constructor(
    reconstruction: readonly Token[] = [],
    lineInfo: LineInfo,
    highlightIndex: number,
    highlightIndexSetter: any
  ) {
    this.reconstruction = reconstruction.map(
      (token) => new LineToken(token as LemmatizableToken)
    )
    this.findChapterLine = () =>
      lineInfo.textService.findChapterLine(
        lineInfo.chapterId,
        lineInfo.lineNumber,
        lineInfo.variantNumber
      )
    this.lineInfo = lineInfo
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
