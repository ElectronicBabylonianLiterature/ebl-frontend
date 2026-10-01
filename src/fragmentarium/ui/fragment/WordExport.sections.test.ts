import $ from 'jquery'
import { Document } from 'docx'
import { wordExport } from 'fragmentarium/ui/fragment/WordExport'
import { createWordService } from 'fragmentarium/ui/fragment/exportWordService.testSupport'
import { getHeading } from 'common/utils/HtmlToWordUtils'
import { getGlossary } from 'common/utils/HtmlToWord'
import { fragmentFactory } from 'test-support/fragment-fixtures'
import { Text } from 'transliteration/domain/text'

const mockGetHeading: jest.MockedFunction<typeof getHeading> = jest.fn()
const mockGetGlossary: jest.MockedFunction<typeof getGlossary> = jest.fn()
jest.mock('common/utils/HtmlToWordUtils', () => ({
  ...jest.requireActual('common/utils/HtmlToWordUtils'),
  getHeading: (...args: Parameters<typeof getHeading>) =>
    mockGetHeading(...args),
}))
jest.mock('common/utils/HtmlToWord', () => ({
  ...jest.requireActual('common/utils/HtmlToWord'),
  getGlossary: (...args: Parameters<typeof getGlossary>) =>
    mockGetGlossary(...args),
}))

describe('a fragment without lines', () => {
  let doc: Document

  beforeEach(async () => {
    mockGetHeading.mockImplementation(
      jest.requireActual('common/utils/HtmlToWordUtils').getHeading,
    )
    const fragment = fragmentFactory.build(
      {},
      { associations: { text: new Text({ lines: [] }) } },
    )
    doc = await wordExport(fragment, createWordService(), $('<div></div>'))
  })

  it('is exported as a document', () => {
    expect(doc).toBeInstanceOf(Document)
  })

  it('keeps the introduction', () => {
    expect(mockGetHeading).toHaveBeenCalledWith('Introduction')
  })

  it('has no edition section', () => {
    expect(mockGetHeading).not.toHaveBeenCalledWith('Edition')
  })

  it('has no glossary', () => {
    expect(mockGetGlossary).not.toHaveBeenCalled()
  })
})
