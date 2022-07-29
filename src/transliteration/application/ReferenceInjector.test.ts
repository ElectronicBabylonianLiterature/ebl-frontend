import BibliographyService from 'bibliography/application/BibliographyService'
import ReferenceInjector from 'transliteration/application/ReferenceInjector'
import { Text } from 'transliteration/domain/text'
import Promise from 'bluebird'
import { bibliographyEntryFactory } from 'test-support/bibliography-fixtures'
import Reference from 'bibliography/domain/Reference'
import { MarkupPart } from 'transliteration/domain/markup'
import { NoteLine } from 'transliteration/domain/note-line'
import { ReferenceDto } from 'bibliography/domain/referenceDto'

jest.mock('bibliography/application/BibliographyService')

const MockBibliographyService = BibliographyService as jest.Mock<
  jest.Mocked<BibliographyService>
>
const bibliographyServiceMock = new MockBibliographyService()

const referenceInjector = new ReferenceInjector(bibliographyServiceMock)

describe('ReferenceInjector', () => {
  const entry = bibliographyEntryFactory.build()
  const referenceDto: ReferenceDto = {
    id: 'RN1',
    type: 'DISCUSSION',
    pages: '5',
    notes: '',
    linesCited: [],
  }
  const bibliographyPart: MarkupPart = {
    reference: referenceDto,
    type: 'BibliographyPart',
  }
  const reference = new Reference('DISCUSSION', '5', '', [], entry)
  const injectedParts = [
    {
      reference: reference,
      type: 'BibliographyPart',
    },
  ]
  const noteLine = new NoteLine({ content: [], parts: [bibliographyPart] })
  const text = new Text({
    lines: [noteLine],
  })

  beforeEach(() => {
    bibliographyServiceMock.find.mockReturnValueOnce(Promise.resolve(entry))
  })

  it('injects references to text', async () => {
    return referenceInjector
      .injectReferencesToText(text)
      .then((injectedText) =>
        expect(injectedText.allLines).toEqual([
          { ...noteLine, parts: injectedParts },
        ])
      )
  })

  it('injects references to MarkupParts', async () => {
    return referenceInjector
      .injectReferencesToMarkup([bibliographyPart])
      .then((parts) => expect(parts).toEqual(injectedParts))
  })

  it('injects references to OldLineNumbers', async () => {
    return referenceInjector
      .injectReferenceToOldLineNumber({
        number: 'A38',
        reference: referenceDto,
      })
      .then((oldLineNumber) =>
        expect(oldLineNumber).toEqual({ number: 'A38', reference: reference })
      )
  })
})
