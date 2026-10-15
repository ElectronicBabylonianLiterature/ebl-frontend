import { LineDetails } from 'corpus/domain/line-details'
import { manuscriptLineDisplayFactory } from 'test-support/line-details-fixtures'
import {
  highlightIndexSetterMock,
  lineGroup,
  lineInfo,
  textServiceMock,
} from 'test-support/line-group-fixtures'
import { implicitFirstColumn } from 'test-support/lines/text-columns'
import { LemmatizableToken } from 'transliteration/domain/token'
import { EmptyLineToken, LineToken } from 'transliteration/ui/line-tokens'
import { LineGroup } from 'transliteration/ui/LineGroup'
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

describe('LineGroup.findChapterLine', () => {
  it('hands the signal to the text service', () => {
    const signal = new AbortController().signal
    textServiceMock.findChapterLine.mockReturnValue(
      new Promise(() => undefined),
    )

    lineGroup.findChapterLine(signal)

    expect(textServiceMock.findChapterLine).toHaveBeenCalledWith(
      lineInfo.chapterId,
      lineInfo.lineNumber,
      lineInfo.variantNumber,
      signal,
    )
  })
})

describe('LineGroup without line details', () => {
  const emptyGroup = new LineGroup(undefined, lineInfo, jest.fn())

  it('has no reconstruction, manuscripts or columns', () => {
    expect(emptyGroup.reconstruction).toEqual([])
    expect(emptyGroup.hasManuscriptLines).toBe(false)
    expect(emptyGroup.manuscripts).toEqual([])
    expect(emptyGroup.manuscriptLines).toEqual([])
    expect(emptyGroup.numberOfColumns).toEqual(0)
  })
})

describe('LineGroup with omitted words', () => {
  it('appends an empty line token for each omitted word', () => {
    const omittingLine = manuscriptLineDisplayFactory.build(
      { omittedWords: [3] },
      { associations: { line: implicitFirstColumn } },
    )
    const group = new LineGroup([], lineInfo, jest.fn())

    group.setLineDetails(
      new LineDetails(
        [
          lineVariantDisplayFactory.build({
            reconstruction: [],
            manuscripts: [omittingLine],
          }),
        ],
        0,
      ),
    )

    expect(group.numberOfColumns).toBeGreaterThan(0)
    expect(group.manuscriptLines[0].slice(-1)).toEqual([
      new EmptyLineToken(omittingLine.siglum, 3),
    ])
  })
})
