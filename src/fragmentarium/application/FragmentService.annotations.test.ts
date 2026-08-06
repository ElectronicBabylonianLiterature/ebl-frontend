import createLemmatizationTestText from 'test-support/test-text'
import Lemmatization, {
  LemmatizationToken,
} from 'transliteration/domain/Lemmatization'
import { Text } from 'transliteration/domain/text'
import { Fragment } from 'fragmentarium/domain/fragment'
import { Colophon } from 'fragmentarium/domain/Colophon'
import LemmatizationFactory from 'fragmentarium/application/LemmatizationFactory'
import { LineLemmaAnnotations } from 'fragmentarium/ui/fragment/lemma-annotation/LemmaAnnotation'
import { ApiEntityAnnotationSpan } from 'fragmentarium/ui/text-annotation/EntityType'
import {
  buildFragmentWithReferences,
  createFragmentServiceTestContext,
  rejectBibliographyLookups,
} from 'fragmentarium/application/FragmentService.testSupport'

jest.mock('fragmentarium/application/LemmatizationFactory')

jest.mock('bibliography/application/BibliographyService', () => {
  return function () {
    return { find: jest.fn(), findMany: jest.fn(), search: jest.fn() }
  }
})

jest.mock('dictionary/infrastructure/WordRepository', () => {
  return function () {
    return { searchLemma: jest.fn(), find: jest.fn(), findAll: jest.fn() }
  }
})

const {
  fragmentRepository,
  wordRepository,
  bibliographyService,
  fragmentService,
} = createFragmentServiceTestContext()

const namedEntityAnnotations: readonly ApiEntityAnnotationSpan[] = [
  {
    id: 'entity-1',
    type: 'PERSONAL_NAME',
    span: ['line:1'],
  },
]

let fragment: Fragment
let result: Fragment

beforeEach(() => {
  fragment = buildFragmentWithReferences('K.1')
  rejectBibliographyLookups(bibliographyService)
})

describe('update lemmatization', () => {
  const lemmatization: Lemmatization = new Lemmatization(
    ['1.'],
    [[new LemmatizationToken('kur', true, [])]],
  )

  beforeEach(async () => {
    fragmentRepository.updateLemmatization.mockReturnValue(
      Promise.resolve(fragment),
    )
    result = await fragmentService.updateLemmatization(
      fragment.number,
      lemmatization.toDto(),
    )
  })

  test('Returns updated fragment', () => expect(result).toEqual(fragment))
  test('Finds correct fragment', () =>
    expect(fragmentRepository.updateLemmatization).toHaveBeenCalledWith(
      fragment.number,
      lemmatization.toDto(),
    ))
})

describe('update references', () => {
  beforeEach(async () => {
    fragmentRepository.updateReferences.mockReturnValue(
      Promise.resolve(fragment),
    )
    result = await fragmentService.updateReferences(
      fragment.number,
      fragment.references,
    )
  })

  test('Returns updated fragment', () => expect(result).toEqual(fragment))
  test('Finds correct fragment', () =>
    expect(fragmentRepository.updateReferences).toHaveBeenCalledWith(
      fragment.number,
      fragment.references,
    ))
})

describe('update lemma annotation', () => {
  const annotations: LineLemmaAnnotations = {
    0: {
      0: ['lemma-a'],
    },
  }

  beforeEach(async () => {
    fragmentRepository.updateLemmaAnnotation.mockReturnValue(
      Promise.resolve(fragment),
    )
    result = await fragmentService.updateLemmaAnnotation(
      fragment.number,
      annotations,
    )
  })

  test('returns updated fragment', () => expect(result).toEqual(fragment))
  test('calls repository with correct parameters', () =>
    expect(fragmentRepository.updateLemmaAnnotation).toHaveBeenCalledWith(
      fragment.number,
      annotations,
    ))
})

describe('update colophon', () => {
  const colophon = new Colophon({ notesToScribalProcess: 'test note' })

  beforeEach(async () => {
    fragmentRepository.updateColophon.mockReturnValue(Promise.resolve(fragment))
    result = await fragmentService.updateColophon(fragment.number, colophon)
  })

  test('returns updated fragment', () => expect(result).toEqual(fragment))
  test('calls repository with correct parameters', () =>
    expect(fragmentRepository.updateColophon).toHaveBeenCalledWith(
      fragment.number,
      colophon,
    ))
})

describe('fetch named entity annotations', () => {
  test('returns named entity annotations', async () => {
    fragmentRepository.fetchNamedEntityAnnotations.mockReturnValue(
      Promise.resolve(namedEntityAnnotations),
    )

    await expect(
      fragmentService.fetchNamedEntityAnnotations(fragment.number),
    ).resolves.toEqual(namedEntityAnnotations)
    expect(fragmentRepository.fetchNamedEntityAnnotations).toHaveBeenCalledWith(
      fragment.number,
      undefined,
    )
  })
})

describe('update named entity annotations', () => {
  beforeEach(async () => {
    fragmentRepository.updateNamedEntityAnnotations.mockReturnValue(
      Promise.resolve(fragment),
    )
    result = await fragmentService.updateNamedEntityAnnotations(
      fragment.number,
      namedEntityAnnotations,
    )
  })

  test('returns updated fragment', () => expect(result).toEqual(fragment))
  test('calls repository with correct parameters', () =>
    expect(
      fragmentRepository.updateNamedEntityAnnotations,
    ).toHaveBeenCalledWith(fragment.number, namedEntityAnnotations))
})

test('createLemmatization', async () => {
  const [text] = createLemmatizationTestText()
  const lemmatization = new Lemmatization([], [])

  const createLemmatization = jest.fn<Promise<Lemmatization>, [Text]>()
  createLemmatization.mockReturnValue(Promise.resolve(lemmatization))
  const MockLemmatizationFactory = LemmatizationFactory as jest.Mock
  MockLemmatizationFactory.mockImplementation(() => ({ createLemmatization }))

  const result = await fragmentService.createLemmatization(text)
  expect(MockLemmatizationFactory).toHaveBeenCalledWith(
    fragmentService,
    wordRepository,
  )
  expect(createLemmatization).toBeCalledWith(text)
  expect(result).toEqual(lemmatization)
})
