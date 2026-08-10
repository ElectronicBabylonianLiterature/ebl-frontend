import Promise from 'bluebird'
import { Fragment } from 'fragmentarium/domain/fragment'
import {
  buildTestFragment,
  fragmentRepository,
  fragmentService,
  stubMissingBibliography,
} from 'fragmentarium/application/fragmentServiceFragments.testSupport'

let fragment: Fragment
let result: Fragment

beforeEach(() => {
  jest.clearAllMocks()
  fragment = buildTestFragment()
  stubMissingBibliography()
})

describe('update edition', () => {
  const edition = {
    transliteration: '1. kur',
    notes: 'notes',
    introduction: 'Introductory @i{text}',
  }

  beforeEach(async () => {
    fragmentRepository.updateEdition.mockReturnValue(Promise.resolve(fragment))
    result = await fragmentService.updateEdition(fragment.number, edition)
  })

  test('Returns updated fragment', () => expect(result).toEqual(fragment))
  test('Finds correct fragment', () => {
    expect(fragmentRepository.updateEdition).toHaveBeenCalledWith(
      fragment.number,
      edition,
    )
  })
})
