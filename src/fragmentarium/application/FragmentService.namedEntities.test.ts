import Promise from 'bluebird'
import FragmentService from 'fragmentarium/application/FragmentService'
import { Fragment } from 'fragmentarium/domain/fragment'
import BibliographyService from 'bibliography/application/BibliographyService'
import WordRepository from 'dictionary/infrastructure/WordRepository'
import { fragmentFactory } from 'test-support/fragment-fixtures'
import { Genres } from 'fragmentarium/domain/Genres'
import { AnnotationSpans } from 'fragmentarium/ui/text-annotation/annotationSpan'
import { AnnotationSaveResult } from 'fragmentarium/ui/text-annotation/annotationSave'

const mockInjectReferencesToText = jest.fn()
const mockInjectReferencesToIntroduction = jest.fn()
const mockInjectReferencesToNotes = jest.fn()

jest.mock('bibliography/application/BibliographyService', () => {
  return function () {
    return { find: jest.fn(), findMany: jest.fn(), search: jest.fn() }
  }
})
jest.mock('dictionary/infrastructure/WordRepository')
jest.mock('transliteration/application/ReferenceInjector', () => {
  return function () {
    return {
      injectReferencesToText: mockInjectReferencesToText,
      injectReferencesToIntroduction: mockInjectReferencesToIntroduction,
      injectReferencesToNotes: mockInjectReferencesToNotes,
    }
  }
})

const fragmentRepository = {
  updateNamedEntityAnnotations: jest.fn(),
}
const imageRepository = { find: jest.fn() }
const bibliographyService = new (BibliographyService as jest.Mock)()
const wordRepository = new (WordRepository as jest.Mock)()

function createService(): FragmentService {
  return new FragmentService(
    fragmentRepository as never,
    imageRepository as never,
    wordRepository,
    bibliographyService,
  )
}

const annotations: AnnotationSpans = {
  namedEntities: [{ id: 'Entity-1', type: 'PERSONAL_NAME', span: ['line:1'] }],
  realia: [{ id: 'Realia-1', realiaId: 'realia_000846', span: ['line:1'] }],
}

let fragment: Fragment
let fragmentService: FragmentService

function stubSuccessfulInjection(target: Fragment): void {
  mockInjectReferencesToText.mockReturnValue(Promise.resolve(target.text))
  mockInjectReferencesToIntroduction.mockReturnValue(
    Promise.resolve(target.introduction),
  )
  mockInjectReferencesToNotes.mockReturnValue(Promise.resolve(target.notes))
}

beforeEach(() => {
  jest.clearAllMocks()
  fragment = fragmentFactory.build(
    { number: 'K.1' },
    { associations: { references: [], genres: new Genres([]) } },
  )
  stubSuccessfulInjection(fragment)
  fragmentService = createService()
})

describe('updateNamedEntityAnnotations', () => {
  describe('when persistence and refresh both succeed', () => {
    let result: AnnotationSaveResult

    beforeEach(async () => {
      fragmentRepository.updateNamedEntityAnnotations.mockReturnValue(
        Promise.resolve(fragment),
      )
      result = await fragmentService.updateNamedEntityAnnotations(
        fragment.number,
        annotations,
      )
    })

    it('posts the annotations to the repository', () =>
      expect(
        fragmentRepository.updateNamedEntityAnnotations,
      ).toHaveBeenCalledWith(fragment.number, annotations))

    it('returns the refreshed fragment', () =>
      expect(result.fragment).toEqual(fragment))

    it('reports no refresh error', () => expect(result.refreshError).toBeNull())
  })

  describe('when persistence succeeds but the refresh fails', () => {
    const refreshError = new Error('Bibliography unavailable.')
    let result: AnnotationSaveResult
    let persisted: Fragment

    beforeEach(async () => {
      persisted = fragment
      mockInjectReferencesToText.mockReturnValue(Promise.reject(refreshError))
      fragmentRepository.updateNamedEntityAnnotations.mockReturnValue(
        Promise.resolve(persisted),
      )
      result = await fragmentService.updateNamedEntityAnnotations(
        fragment.number,
        annotations,
      )
    })

    it('still resolves with the persisted fragment', () =>
      expect(result.fragment).toEqual(persisted))

    it('reports the refresh error separately', () =>
      expect(result.refreshError).toEqual(refreshError))
  })

  describe('when persistence fails', () => {
    const saveError = new Error('Save failed.')

    it('rejects with the persistence error', async () => {
      fragmentRepository.updateNamedEntityAnnotations.mockReturnValue(
        Promise.reject(saveError),
      )

      await expect(
        fragmentService.updateNamedEntityAnnotations(
          fragment.number,
          annotations,
        ),
      ).rejects.toThrow(saveError)
    })
  })
})
