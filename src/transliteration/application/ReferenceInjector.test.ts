import BibliographyService from 'bibliography/application/BibliographyService'
import ReferenceInjector from 'transliteration/application/ReferenceInjector'
import Promise from 'bluebird'
import { bibliographyEntryFactory } from 'test-support/bibliography-fixtures'
import Reference from 'bibliography/domain/Reference'
import { MarkupPart } from 'transliteration/domain/markup'

jest.mock('bibliography/application/BibliographyService')

const MockBibliographyService = BibliographyService as jest.Mock<
  jest.Mocked<BibliographyService>
>
const bibliographyServiceMock = new MockBibliographyService()

const referenceInjector = new ReferenceInjector(bibliographyServiceMock)

describe('ReferenceInjector', () => {
  const entry = bibliographyEntryFactory.build()
  const bibliographyPart: MarkupPart = {
    reference: {
      id: 'RN1',
      type: 'DISCUSSION',
      pages: '5',
      notes: '',
      linesCited: [],
    },
    type: 'BibliographyPart',
  }
  const reference = new Reference('DISCUSSION', '5', '', [], entry)

  beforeEach(() => {
    bibliographyServiceMock.find.mockReturnValueOnce(Promise.resolve(entry))
  })

  it('injects references to MarkupParts', async () => {
    return referenceInjector
      .injectReferencesToMarkup([bibliographyPart])
      .then((parts) =>
        expect(parts).toEqual([
          {
            reference: reference,
            type: 'BibliographyPart',
          },
        ])
      )
  })
})
