import TextService from 'corpus/application/TextService'
import { LineDetails, LineVariantDetails } from 'corpus/domain/line-details'
import { manuscriptLineDisplayFactory } from 'test-support/line-details-fixtures'
import { implicitFirstColumn } from 'test-support/lines/text-columns'
import { LemmatizableToken } from 'transliteration/domain/token'
import { LineToken } from './line-tokens'
import { LineGroup, LineInfo } from './LineGroup'

jest.mock('corpus/application/TextService')

const MockTextService = TextService as jest.Mock<jest.Mocked<TextService>>
const textServiceMock = new MockTextService()
const manuscriptLine = manuscriptLineDisplayFactory.build(
  {},
  { associations: { line: implicitFirstColumn } }
)
const lineDetails = new LineDetails(
  [new LineVariantDetails([], null, [manuscriptLine], [], [])],
  0
)
const lineTokens = manuscriptLine.line.content.map(
  (token) => new LineToken(token as LemmatizableToken, manuscriptLine.siglum)
)

const lineInfo: LineInfo = {
  chapterId: {
    textId: { genre: '', category: 0, index: 0 },
    stage: '',
    name: '',
  },
  lineNumber: 0,
  variantNumber: 0,
  textService: textServiceMock,
}

const highlightIndexSetterMock = jest.fn()

const lineGroup = new LineGroup([], lineInfo, highlightIndexSetterMock)

describe('setters', () => {
  it('called setActiveTokenIndex', () => {
    lineGroup.setActiveTokenIndex(2)
    expect(highlightIndexSetterMock).toHaveBeenCalledWith(2)
  })
  it('set index', () => {
    lineGroup.setActiveTokenIndex(2)
    expect(lineGroup.highlightIndex).toEqual(2)
  })
  it('set lineDetails', () => {
    lineGroup.setLineDetails(lineDetails)
    expect(lineGroup.lineDetails).toEqual(lineDetails)
  })
  it('set manuscriptLines', () => {
    lineGroup.setLineDetails(lineDetails)
    expect(lineGroup.manuscriptLines).toEqual([lineTokens])
  })
})
