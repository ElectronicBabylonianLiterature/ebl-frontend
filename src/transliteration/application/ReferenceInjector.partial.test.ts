import BibliographyService from 'bibliography/application/BibliographyService'
import BibliographyEntry from 'bibliography/domain/BibliographyEntry'
import Reference from 'bibliography/domain/Reference'
import { ReferenceDto } from 'bibliography/domain/referenceDto'
import ReferenceInjector from 'transliteration/application/ReferenceInjector'
import { BibliographyPart, MarkupPart } from 'transliteration/domain/markup'
import { isBibliographyPart } from 'transliteration/domain/type-guards'
import { bibliographyEntryFactory } from 'test-support/bibliography-fixtures'

jest.mock('bibliography/application/BibliographyService')

const MockBibliographyService = BibliographyService as jest.Mock<
  jest.Mocked<BibliographyService>
>

function createPart(id: string, pages = ''): BibliographyPart {
  const reference: ReferenceDto = {
    id,
    type: 'DISCUSSION',
    pages,
    notes: '',
    linesCited: [],
  }
  return { type: 'BibliographyPart', reference }
}

function expectHydrated(
  part: MarkupPart,
  entry: BibliographyEntry,
  source: ReferenceDto,
): void {
  expect(isBibliographyPart(part)).toBe(true)
  if (!isBibliographyPart(part)) {
    throw new Error('Expected bibliography part')
  }
  expect(part.reference).toBeInstanceOf(Reference)
  if (!(part.reference instanceof Reference)) {
    throw new Error('Expected hydrated reference')
  }
  expect(part.reference.id).toBe(entry.id)
  expect(part.reference.type).toBe(source.type)
  expect(part.reference.pages).toBe(source.pages)
  expect(part.reference.notes).toBe(source.notes)
  expect(part.reference.linesCited).toEqual(source.linesCited)
}

test('hydrates resolved siblings and leaves a missing reference unchanged', async () => {
  const bibliographyService = new MockBibliographyService()
  const referenceInjector = new ReferenceInjector(bibliographyService)
  const firstEntry = bibliographyEntryFactory.build(
    {},
    { associations: { id: 'samet2014lamentation' } },
  )
  const secondEntry = bibliographyEntryFactory.build(
    {},
    { associations: { id: 'attinger2015nouvelle' } },
  )
  const firstPart = createPart(firstEntry.id)
  const missingPart = createPart('attinger2014lamentation')
  const secondPart: BibliographyPart = {
    type: 'BibliographyPart',
    reference: {
      id: secondEntry.id,
      type: 'COPY',
      pages: '12–14',
      notes: 'Collated in Aššur',
      linesCited: ['o 1', 'r 2'],
    },
  }
  bibliographyService.findManyById.mockResolvedValue(
    new Map([
      [firstEntry.id, firstEntry],
      [secondEntry.id, secondEntry],
    ]),
  )

  const result = await referenceInjector.injectReferencesToMarkup([
    firstPart,
    missingPart,
    secondPart,
  ])

  expectHydrated(result[0], firstEntry, firstPart.reference)
  expect(result[1]).toBe(missingPart)
  expectHydrated(result[2], secondEntry, secondPart.reference)
})

test('hydrates a requested alias with its canonical document', async () => {
  const requestedId = 'former-entry-id'
  const canonicalEntry = bibliographyEntryFactory.build(
    {},
    { associations: { id: 'canonical-entry-id' } },
  )
  const bibliographyService = new MockBibliographyService()
  const referenceInjector = new ReferenceInjector(bibliographyService)
  bibliographyService.findManyById.mockResolvedValue(
    new Map([[requestedId, canonicalEntry]]),
  )

  const [result] = await referenceInjector.injectReferencesToMarkup([
    createPart(requestedId),
  ])

  expectHydrated(result, canonicalEntry, createPart(requestedId).reference)
})
