import Promise from 'bluebird'
import _ from 'lodash'
import createLemmatizationTestText from 'test-support/test-text'
import Lemma from 'transliteration/domain/Lemma'
import Lemmatization, {
  LemmatizationToken,
} from 'transliteration/domain/Lemmatization'
import FragmentService from './FragmentService'
import LemmatizationFactory from './LemmatizationFactory'
import WordRepository from 'dictionary/infrastructure/WordRepository'

jest.mock('dictionary/infrastructure/WordRepository')
jest.mock('./FragmentService')

const MockWordRepository = WordRepository as jest.Mock<WordRepository>
const wordRepositoryMock = new MockWordRepository()

const MockFragmentService = FragmentService as jest.Mock<FragmentService>
const fragmetServiceMock = new MockFragmentService()

test('createLemmatization', async () => {
  const [text, words] = await createLemmatizationTestText()
  const wordMap = _.keyBy(words, '_id')
  const suggestions = {
    kur: [[new Lemma(words[2])]],
    nu: [[new Lemma(words[3])]],
  }
  ;(wordRepositoryMock.find as jest.Mock).mockImplementation((id) =>
    wordMap[id] ? Promise.resolve(wordMap[id]) : Promise.reject(new Error()),
  )
  ;(fragmetServiceMock.findSuggestions as jest.Mock).mockImplementation(
    (word) => Promise.resolve(suggestions[word] ? suggestions[word] : []),
  )

  const expectedLemmas = _([words[0]])
    .map((word) => new Lemma(word))
    .keyBy('value')
    .value()
  const lemmatization = new Lemmatization(
    ['1.', '#note: '],
    text.allLines.map((line) =>
      line.content.map(
        (token) =>
          new LemmatizationToken(
            token.value,
            token.lemmatizable ?? false,
            token.uniqueLemma?.map((lemma) => expectedLemmas[lemma]) ?? null,
            token.lemmatizable ? (suggestions[token.cleanValue] ?? []) : null,
          ),
      ),
    ),
  )

  const result = await new LemmatizationFactory(
    fragmetServiceMock,
    wordRepositoryMock,
  ).createLemmatization(text)
  expect(result).toEqual(lemmatization)
})
