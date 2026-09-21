import BibliographyService from 'bibliography/application/BibliographyService'
import ReferenceInjector from 'transliteration/application/ReferenceInjector'
import { Text } from 'transliteration/domain/text'
import Promise from 'bluebird'
import { bibliographyEntryFactory } from 'test-support/bibliography-fixtures'
import BibliographyEntry from 'bibliography/domain/BibliographyEntry'
import Reference from 'bibliography/domain/Reference'
import { MarkupPart, TextPart } from 'transliteration/domain/markup'
import { NoteLine } from 'transliteration/domain/note-line'
import { ReferenceDto } from 'bibliography/domain/referenceDto'

jest.mock('bibliography/application/BibliographyService')

const MockBibliographyService = BibliographyService as jest.Mock<
  jest.Mocked<BibliographyService>
>
const bibliographyServiceMock = new MockBibliographyService()

const referenceInjector = new ReferenceInjector(bibliographyServiceMock)
const referenceId = 'RN1'

describe('ReferenceInjector', () => {
  const entry = bibliographyEntryFactory.build(
    {},
    { associations: { id: referenceId } },
  )
  const referenceDto: ReferenceDto = {
    id: referenceId,
    type: 'DISCUSSION',
    pages: '5',
    notes: '',
    linesCited: [],
  }
  const bibliographyPart: MarkupPart = {
    reference: referenceDto,
    type: 'BibliographyPart',
  }
  const stringPart: TextPart = {
    text: 'Lorem ipsum',
    type: 'StringPart',
  }
  const emphasisPart: TextPart = {
    text: 'Lorem ipsum',
    type: 'EmphasisPart',
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
    bibliographyServiceMock.findManyById.mockReturnValueOnce(
      Promise.resolve(new Map([[entry.id, entry]])),
    )
  })

  it('injects references to text', async () => {
    return referenceInjector
      .injectReferencesToText(text)
      .then((injectedText) =>
        expect(injectedText.allLines).toEqual([
          { ...noteLine, parts: injectedParts },
        ]),
      )
  })

  it('injects references to MarkupParts', async () => {
    return referenceInjector
      .injectReferencesToMarkup([emphasisPart, bibliographyPart, stringPart])
      .then((parts) =>
        expect(parts).toEqual([emphasisPart, ...injectedParts, stringPart]),
      )
  })

  it('supports bibliography services without requested-id map lookup', async () => {
    const legacyBibliographyService = {
      find: jest.fn<Promise<BibliographyEntry>, [string]>(),
      findMany: jest
        .fn<Promise<readonly BibliographyEntry[]>, [readonly string[]]>()
        .mockReturnValue(Promise.resolve([entry])),
    }
    const legacyReferenceInjector = new ReferenceInjector(
      legacyBibliographyService,
    )

    await expect(
      legacyReferenceInjector.injectReferencesToMarkup([bibliographyPart]),
    ).resolves.toEqual(injectedParts)
    expect(legacyBibliographyService.findMany).toHaveBeenCalledWith([
      referenceId,
    ])
  })

  it('injects references to OldLineNumbers', async () => {
    return referenceInjector
      .injectReferenceToOldLineNumber({
        number: 'A38',
        reference: referenceDto as Reference,
      })
      .then((oldLineNumber) =>
        expect(oldLineNumber).toEqual({ number: 'A38', reference: reference }),
      )
  })
})
