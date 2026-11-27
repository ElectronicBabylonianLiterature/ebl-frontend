import _ from 'lodash'
import Word from 'dictionary/domain/Word'
import EditLiteFakeApi from 'corpus/ui/edit-lite/EditLiteFakeApi.testSupport'
import EditLiteFakeDictionary, {
  buildWordsPath,
  FakeLemmaSuggestion,
  lemmaBatchPath,
  properNounPath,
} from 'corpus/ui/edit-lite/EditLiteFakeDictionary.testSupport'
import {
  invalidRequestMessage,
  maximumLemmaWords,
} from 'corpus/ui/edit-lite/editLiteFakeRequests.testSupport'
import { buildDictionaryWord } from 'corpus/ui/edit-lite/editLiteTokens.testSupport'
import { ApiError } from 'http/ApiClient'

const enuma: Word = buildDictionaryWord('enūma')
const elish: Word = buildDictionaryWord('eliš')
const otherElish: Word = buildDictionaryWord('eliš', 'II')
const suggestions: readonly FakeLemmaSuggestion[] = [
  { word: 'eliš', isNormalized: true, lemmas: [['eliš I'], ['eliš II']] },
  { word: 'eliš', isNormalized: false, lemmas: [['eliš II', 'enūma I']] },
]
const normalizedElish = { word: 'eliš', isNormalized: true }

let fakeApi: EditLiteFakeApi

function postWords(body: unknown): Promise<unknown> {
  return fakeApi.client.postJson(lemmaBatchPath, body, false)
}

beforeEach(() => {
  fakeApi = new EditLiteFakeApi().serveDictionary(
    new EditLiteFakeDictionary([enuma, elish, otherElish], suggestions),
  )
})

test('the words have the ids and lemmas they are built for', () => {
  expect(otherElish).toMatchObject({
    _id: 'eliš II',
    lemma: ['eliš'],
    homonym: 'II',
  })
  expect(enuma._id).toBe('enūma I')
})

test('the suggestions of several words are answered in the order they are asked', async () => {
  const words = [
    normalizedElish,
    { word: 'enūma', isNormalized: true },
    { word: 'eliš', isNormalized: false },
    normalizedElish,
  ]

  await expect(postWords({ words })).resolves.toEqual([
    { ...normalizedElish, lemmas: [[elish], [otherElish]] },
    { word: 'enūma', isNormalized: true, lemmas: [] },
    { word: 'eliš', isNormalized: false, lemmas: [[enuma, otherElish]] },
    { ...normalizedElish, lemmas: [[elish], [otherElish]] },
  ])
})

test('a dictionary without suggestions answers every word with none', async () => {
  fakeApi = new EditLiteFakeApi().serveDictionary(
    new EditLiteFakeDictionary([elish]),
  )

  await expect(postWords({ words: [normalizedElish] })).resolves.toEqual([
    { ...normalizedElish, lemmas: [] },
  ])
})

test.each<[string, unknown]>([
  ['no words field', {}],
  ['no word', { words: [] }],
  [
    'more words than allowed',
    { words: _.times(maximumLemmaWords + 1, _.constant(normalizedElish)) },
  ],
  ['words that are not a list', { words: normalizedElish }],
  ['a word without the flag', { words: [{ word: 'eliš' }] }],
  ['a flag as text', { words: [{ word: 'eliš', isNormalized: 'true' }] }],
  ['a word that is not text', { words: [{ word: 1, isNormalized: true }] }],
  ['an unknown word field', { words: [{ ...normalizedElish, language: 'A' }] }],
  ['an unknown field', { words: [normalizedElish], genre: 'L' }],
])('a batch with %s is malformed', async (_name, body) => {
  const error = await postWords(body).catch((reason: unknown) => reason)

  expect(maximumLemmaWords).toBe(200)
  expect(error).toBeInstanceOf(ApiError)
  expect(error).toMatchObject({ status: 400, message: invalidRequestMessage })
})

test('as many words as allowed are answered', async () => {
  const words = _.times(maximumLemmaWords, _.constant(normalizedElish))

  await expect(postWords({ words })).resolves.toHaveLength(maximumLemmaWords)
})

test('the words of the given ids are found in one request', async () => {
  expect(buildWordsPath(['eliš II', 'enūma I'])).toBe(
    '/words?lemmas=eli%C5%A1%20II%2Cen%C5%ABma%20I',
  )
  await expect(
    fakeApi.client.fetchJson(buildWordsPath(['eliš II', 'enūma I']), false),
  ).resolves.toEqual([enuma, otherElish])
  await expect(
    fakeApi.client.fetchJson(buildWordsPath(['ilu I']), false),
  ).resolves.toEqual([])
})

test('lemmas are searched by their beginning', async () => {
  await expect(
    fakeApi.client.fetchJson('/words?lemma=el', false),
  ).resolves.toEqual([elish, otherElish])
})

test('nothing else is served', async () => {
  await expect(
    fakeApi.client.fetchJson('/words?query=eli', false),
  ).rejects.toThrow('Unexpected not-authenticated fetchJson')
  await expect(
    fakeApi.client.fetchJson('/lemmas/batch', false),
  ).rejects.toThrow('Unexpected not-authenticated fetchJson')
  await expect(fakeApi.client.postJson('/words', {})).rejects.toThrow(
    'Unexpected postJson',
  )
})

test('a proper noun is created with its tag and found afterwards', async () => {
  const created = await fakeApi.client.postJson(properNounPath, {
    lemma: 'Marduk',
    namedEntityTags: ['DN'],
  })

  expect(created).toMatchObject({
    _id: 'Marduk DN',
    lemma: ['Marduk'],
    pos: [],
    namedEntityTags: ['DN'],
  })
  await expect(
    fakeApi.client.fetchJson(buildWordsPath(['Marduk DN']), false),
  ).resolves.toEqual([created])
  await expect(
    fakeApi.client.fetchJson('/words?lemma=Mar', false),
  ).resolves.toEqual([created])
})

test.each<[string, unknown]>([
  ['without a lemma', { namedEntityTags: ['DN'] }],
  ['with an empty lemma', { lemma: '', namedEntityTags: ['DN'] }],
  ['without a tag', { lemma: 'Marduk', namedEntityTags: [] }],
  ['with two tags', { lemma: 'Marduk', namedEntityTags: ['DN', 'GN'] }],
  ['with an empty tag', { lemma: 'Marduk', namedEntityTags: [''] }],
  ['with tags that are no list', { lemma: 'Marduk', namedEntityTags: 'DN' }],
  [
    'with an unknown field',
    { lemma: 'Marduk', namedEntityTags: ['DN'], pos: [] },
  ],
])('a proper noun %s is refused', async (_name, body) => {
  const error = await fakeApi.client
    .postJson(properNounPath, body)
    .catch((reason: unknown) => reason)

  expect(error).toBeInstanceOf(ApiError)
  expect(error).toMatchObject({ status: 400, message: invalidRequestMessage })
  await expect(
    fakeApi.client.fetchJson('/words?lemma=Mar', false),
  ).resolves.toEqual([])
})
