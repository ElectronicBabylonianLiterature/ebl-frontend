import BibliographyService from 'bibliography/application/BibliographyService'
import { ReferenceDto } from 'bibliography/domain/referenceDto'
import { ApiError } from 'http/ApiClient'
import Reference from 'bibliography/domain/Reference'
import ReferenceInjector from 'transliteration/application/ReferenceInjector'
import { MarkupPart } from 'transliteration/domain/markup'
import * as Sentry from '@sentry/react'

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
  afterEach(() => jest.restoreAllMocks())

  test.each(
    systemicErrors.filter(([name]) => name !== 'whole-batch not found'),
  )(
    'preserves an old line citation and reports a %s error',
    async (_, createError) => {
      const error = createError()
      const bibliographyService = new MockBibliographyService()
      const reportError = jest.fn()
      const referenceInjector = new ReferenceInjector(
        bibliographyService,
        reportError,
      )
      bibliographyService.find.mockRejectedValue(error)

      const result = await referenceInjector.injectReferenceToOldLineNumber({
        number: 'A38',
        reference,
      })

      expect(result.number).toBe('A38')
      expect(result.reference).toBeInstanceOf(Reference)
      expect(result.reference).toMatchObject({
        ...reference,
        referenceId: reference.id,
        hasUnresolvedDocument: true,
      })
      expect(reportError).toHaveBeenCalledWith(error)
    },
  )

  test('preserves a missing old line citation without reporting an outage', async () => {
    const bibliographyService = new MockBibliographyService()
    const reportError = jest.fn()
    const referenceInjector = new ReferenceInjector(
      bibliographyService,
      reportError,
    )
    bibliographyService.find.mockRejectedValue(
      new ApiError('Not Found', {}, 404),
    )

    const result = await referenceInjector.injectReferenceToOldLineNumber({
      number: 'A38',
      reference,
    })

    expect(result.reference).toMatchObject({
      ...reference,
      referenceId: reference.id,
      hasUnresolvedDocument: true,
    })
    expect(reportError).not.toHaveBeenCalled()
  })

  test('uses fallback telemetry by default for an HTTP outage', async () => {
    const bibliographyService = new MockBibliographyService()
    const error = new ApiError('Service unavailable', {}, 500)
    const capture = jest
      .spyOn(Sentry, 'captureException')
      .mockReturnValue('event-id')
    bibliographyService.findManyById.mockRejectedValue(error)

    await expect(
      new ReferenceInjector(bibliographyService).injectReferencesToMarkup([
        bibliographyPart,
      ]),
    ).resolves.toEqual([bibliographyPart])

    expect(capture).toHaveBeenCalledWith(
      expect.objectContaining({ cause: error }),
    )
  })

  test.each(systemicErrors)(
    'preserves markup and reports a %s error',
    async (_, createError) => {
      const error = createError()
      const bibliographyService = new MockBibliographyService()
      const reportError = jest.fn()
      const referenceInjector = new ReferenceInjector(
        bibliographyService,
        reportError,
      )
      bibliographyService.findManyById.mockRejectedValue(error)

      await expect(
        referenceInjector.injectReferencesToMarkup([bibliographyPart]),
      ).resolves.toEqual([bibliographyPart])
      expect(reportError).toHaveBeenCalledWith(error)
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
