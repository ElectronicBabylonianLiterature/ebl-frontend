import Word from 'dictionary/domain/Word'
import {
  createLemmaOptionsLoader,
  LemmaOption,
} from 'fragmentarium/ui/lemmatization/lemmaOptions'
import { wordFactory } from 'test-support/word-fixtures'

const searchLemma = jest.fn<Promise<readonly Word[]>, [string]>()

function loadOptions(language?: string): Promise<LemmaOption[]> {
  return new Promise((resolve) =>
    createLemmaOptionsLoader({ searchLemma }, language)('šar', resolve),
  )
}

beforeEach(() => {
  jest.clearAllMocks()
})

it('passes the found lemmas to the callback', async () => {
  const word = wordFactory.build({ lemma: ['šarru'], homonym: 'I' })
  searchLemma.mockResolvedValue([word])

  await expect(loadOptions()).resolves.toEqual([
    expect.objectContaining({ value: word._id, lemma: word.lemma.join(' ') }),
  ])
  expect(searchLemma).toHaveBeenCalledWith('šar')
})

it('passes no lemmas to the callback when the search fails', async () => {
  searchLemma.mockRejectedValue(new Error('Network error'))

  await expect(loadOptions('AKKADIAN')).resolves.toEqual([])
})
