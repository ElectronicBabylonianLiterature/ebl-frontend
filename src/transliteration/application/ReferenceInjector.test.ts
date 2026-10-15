import ReferenceInjector from 'transliteration/application/ReferenceInjector'
import BibliographyService from 'bibliography/application/BibliographyService'
import Reference from 'bibliography/domain/Reference'
import { BibliographyPart, MarkupPart } from 'transliteration/domain/markup'
import { bibliographyEntryFactory } from 'test-support/bibliography-fixtures'
import { expectConsoleErrors } from 'setupTests'
import { Text } from 'transliteration/domain/text'
import { NoteLine } from 'transliteration/domain/note-line'

jest.mock('bibliography/application/BibliographyService')

const bibliographyService = new (BibliographyService as jest.Mock<
  jest.Mocked<BibliographyService>
>)()
const referenceInjector = new ReferenceInjector(bibliographyService)

const entry = bibliographyEntryFactory.build({ id: 'RN1' })
const bibliographyPart: BibliographyPart = {
  type: 'BibliographyPart',
  reference: {
    id: entry.id,
    type: 'DISCUSSION',
    pages: '12',
    notes: '',
    linesCited: [],
  },
}
const stringPart: MarkupPart = { type: 'StringPart', text: 'see ' }

beforeEach(() => {
  jest.clearAllMocks()
})

it('returns parts without bibliography unchanged and fetches nothing', async () => {
  await expect(
    referenceInjector.injectReferencesToMarkup([stringPart]),
  ).resolves.toEqual([stringPart])
  expect(bibliographyService.findMany).not.toHaveBeenCalled()
})

it('replaces a bibliography reference with its resolved entry', async () => {
  bibliographyService.findMany.mockResolvedValue([entry])

  const [first, second] = await referenceInjector.injectReferencesToMarkup([
    stringPart,
    bibliographyPart,
    bibliographyPart,
  ])

  expect(bibliographyService.findMany).toHaveBeenCalledWith([entry.id])
  expect(first).toEqual(stringPart)
  expect(second).toEqual({
    type: 'BibliographyPart',
    reference: new Reference('DISCUSSION', '12', '', [], entry),
  })
})

it('keeps the original parts and reports the error when lookup fails', async () => {
  expectConsoleErrors(/RN1 not found/)
  bibliographyService.findMany.mockRejectedValue(new Error('RN1 not found'))

  await expect(
    referenceInjector.injectReferencesToMarkup([bibliographyPart]),
  ).resolves.toEqual([bibliographyPart])
})

it('injects references to the markup lines of a text', async () => {
  bibliographyService.findMany.mockResolvedValue([entry])
  const text = new Text({
    lines: [new NoteLine({ content: [], parts: [bibliographyPart] })],
  })

  const injectedText = await referenceInjector.injectReferencesToText(text)

  expect(injectedText.allLines).toEqual([
    new NoteLine({
      content: [],
      parts: [
        {
          type: 'BibliographyPart',
          reference: new Reference('DISCUSSION', '12', '', [], entry),
        },
      ],
    }),
  ])
})

it('injects the reference of an old line number', async () => {
  bibliographyService.find.mockResolvedValue(entry)

  await expect(
    referenceInjector.injectReferenceToOldLineNumber({
      number: 'A38',
      reference: bibliographyPart.reference,
    }),
  ).resolves.toEqual({
    number: 'A38',
    reference: new Reference('DISCUSSION', '12', '', [], entry),
  })
})
