import ReferenceInjector from 'transliteration/application/ReferenceInjector'
import BibliographyService from 'bibliography/application/BibliographyService'
import Reference from 'bibliography/domain/Reference'
import { BibliographyPart, MarkupPart } from 'transliteration/domain/markup'
import { bibliographyEntryFactory } from 'test-support/bibliography-fixtures'
import { expectConsoleErrors } from 'setupTests'

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
