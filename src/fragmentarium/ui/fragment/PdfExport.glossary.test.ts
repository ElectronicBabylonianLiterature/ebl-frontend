import $ from 'jquery'
import WordService from 'dictionary/application/WordService'
import { pdfExport } from 'fragmentarium/ui/fragment/PdfExport'
import { fragmentFactory } from 'test-support/fragment-fixtures'
import { Text } from 'transliteration/domain/text'

jest.mock('dictionary/application/WordService')

it('exports a fragment without glossary', async () => {
  const wordService = new (WordService as jest.Mock<jest.Mocked<WordService>>)()
  wordService.findAll.mockResolvedValue([])
  const fragment = fragmentFactory.build(
    {},
    { associations: { text: new Text({ lines: [] }) } },
  )

  const doc = await pdfExport(fragment, wordService, $('<div></div>'))

  expect(doc.getNumberOfPages()).toEqual(1)
})
