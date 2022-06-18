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
  highlightIndex = 0
  highlightIndexSetter: React.Dispatch<React.SetStateAction<number>>
  lineInfo: LineInfo
  findChapterLine: () => Bluebird<LineDetails>
  lineDetails: LineDetails | null = null

  constructor(
    reconstruction: readonly Token[] = [],
    lineInfo: LineInfo,
    highlightIndexSetter: React.Dispatch<React.SetStateAction<number>>
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
    this.highlightIndexSetter = highlightIndexSetter
  }

  public get numberOfColumns(): number {
    return this.lineDetails?.numberOfColumns ?? 0
  }

  public get hasManuscriptLines(): boolean {
    return this.manuscriptLines !== null
  }

  public setLineDetails(lineDetails: LineDetails): void {
    this.lineDetails = lineDetails
    this.setManuscriptLines(lineDetails.manuscriptsOfVariant)
  }

  private setManuscriptLines(manuscriptLines: ManuscriptLineDisplay[]): void {
    this.manuscriptLines = manuscriptLines.map((manuscriptLine) =>
      manuscriptLine.line.content.map(
        (token) =>
          new LineToken(token as LemmatizableToken, manuscriptLine.siglum)
      )
    )
  }

  public setActiveTokenIndex(index: number): void {
    this.highlightIndexSetter(index)
    this.highlightIndex = index
  }

  public setReconstructionLemmas(lemmas: DictionaryWord[][]): void {
    this.reconstruction.map((token, index) => token.setLemma(lemmas[index]))
  }
}
