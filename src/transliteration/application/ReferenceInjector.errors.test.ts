import BibliographyService from 'bibliography/application/BibliographyService'
import { ReferenceDto } from 'bibliography/domain/referenceDto'
import { ApiError } from 'http/ApiClient'
import ReferenceInjector from 'transliteration/application/ReferenceInjector'
import { MarkupPart } from 'transliteration/domain/markup'

jest.mock('bibliography/application/BibliographyService')

const MockBibliographyService = BibliographyService as jest.Mock<
  jest.Mocked<BibliographyService>
>

const reference: ReferenceDto = {
  id: 'attinger2014lamentation',
  type: 'DISCUSSION',
  pages: '12–14',
  notes: 'Collated in Aššur',
  linesCited: ['o 1', 'r 2'],
}
const bibliographyPart: MarkupPart = {
  type: 'BibliographyPart',
  reference,
}
const systemicErrors: ReadonlyArray<[string, () => Error]> = [
  ['whole-batch not found', () => new ApiError('Not Found', {}, 404)],
  ['network', () => new Error('Network unavailable')],
  ['authentication', () => new ApiError('Unauthorized', {}, 401)],
  ['authorization', () => new ApiError('Forbidden', {}, 403)],
  ['server', () => new ApiError('Server error', {}, 500)],
  ['malformed response', () => new SyntaxError('Invalid JSON')],
]

describe('ReferenceInjector errors', () => {
  test.each(systemicErrors)(
    'propagates the identical %s error',
    async (_, createError) => {
      const error = createError()
      const bibliographyService = new MockBibliographyService()
      const referenceInjector = new ReferenceInjector(bibliographyService)
      bibliographyService.findManyById.mockRejectedValue(error)

      await expect(
        referenceInjector.injectReferencesToMarkup([bibliographyPart]),
      ).rejects.toBe(error)
    },
  )

  test('does not request bibliography for markup without references', async () => {
    const bibliographyService = new MockBibliographyService()
    const referenceInjector = new ReferenceInjector(bibliographyService)
    const parts: readonly MarkupPart[] = [
      { type: 'StringPart', text: 'No bibliography' },
    ]

    await expect(
      referenceInjector.injectReferencesToMarkup(parts),
    ).resolves.toEqual(parts)
    expect(bibliographyService.findManyById).not.toHaveBeenCalled()
  })
})
