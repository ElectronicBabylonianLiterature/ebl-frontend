import Promise from 'bluebird'
import { castDraft, Draft, produce } from 'immer'
import { Fragment } from 'fragmentarium/domain/fragment'
import { Archaeology } from 'fragmentarium/domain/archaeology'
import {
  ArchaeologyDto,
  toArchaeologyDto,
} from 'fragmentarium/domain/archaeologyDtos'
import { archaeologyFactory } from 'test-support/fragment-data-fixtures'
import { Colophon } from 'fragmentarium/domain/Colophon'
import Lemmatization, {
  LemmatizationToken,
} from 'transliteration/domain/Lemmatization'
import { LineLemmaAnnotations } from 'fragmentarium/ui/fragment/lemma-annotation/LemmaAnnotation'
import {
  buildTestFragment,
  fragmentRepository,
  fragmentService,
  stubMissingBibliography,
} from 'fragmentarium/application/fragmentServiceFragments.testSupport'

let archaeology: Archaeology
let archaeologyDto: ArchaeologyDto

let fragment: Fragment
let result: Fragment

beforeEach(() => {
  jest.clearAllMocks()
  fragment = buildTestFragment()
  stubMissingBibliography()
})

describe('update archaeology', () => {
  let expectedFragment: Fragment

  beforeEach(async () => {
    archaeology = archaeologyFactory.build()
    archaeologyDto = toArchaeologyDto(archaeology)
    expectedFragment = produce(fragment, (draft: Draft<Fragment>) => {
      draft.archaeology = castDraft(archaeology)
    })
    fragmentRepository.updateArchaeology.mockReturnValue(
      Promise.resolve(expectedFragment),
    )
    result = await fragmentService.updateArchaeology(
      fragment.number,
      archaeologyDto,
    )
  })
  test('returns updated fragment', () =>
    expect(result).toEqual(expectedFragment))
  test('calls repository with correct parameters', () =>
    expect(fragmentRepository.updateArchaeology).toHaveBeenCalledWith(
      fragment.number,
      archaeologyDto,
    ))
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
