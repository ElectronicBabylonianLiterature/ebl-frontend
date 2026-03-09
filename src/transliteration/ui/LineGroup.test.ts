import { LineDetails } from 'corpus/domain/line-details'
import { manuscriptLineDisplayFactory } from 'test-support/line-details-fixtures'
import {
  highlightIndexSetterMock,
  lineGroup,
} from 'test-support/line-group-fixtures'
import { implicitFirstColumn } from 'test-support/lines/text-columns'
import { LemmatizableToken } from 'transliteration/domain/token'
import { LineToken } from './line-tokens'
import { lineVariantDisplayFactory } from 'test-support/dictionary-line-fixtures'

const manuscriptLine = manuscriptLineDisplayFactory.build(
  {},
  { associations: { line: implicitFirstColumn } },
)
const lineDetails = new LineDetails(
  [
    lineVariantDisplayFactory.build({
      reconstruction: [],
      manuscripts: [manuscriptLine],
    }),
  ],
  0,
)
const lineTokens = manuscriptLine.line.content.map(
  (token) => new LineToken(token as LemmatizableToken, manuscriptLine.siglum),
)

describe('LineGroup setters', () => {
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
