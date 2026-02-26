import {
  chapterDisplayFactory,
  chapterIdFactory,
} from 'test-support/chapter-fixtures'
import { Author, Translator } from 'corpus/domain/chapter'
import { textIdToDoiString } from 'transliteration/domain/text-id'
import { stageToAbbreviation } from 'common/period'

const author: Author = {
  name: 'name 1',
  prefix: '',
  role: 'EDITOR',
  orcidNumber: '',
}
const enTranslator: Translator = {
  name: 'name 2',
  prefix: '',
  orcidNumber: '',
  language: 'en',
}
const deTranslator: Translator = {
  name: 'name 3',
  prefix: '',
  orcidNumber: '',
  language: 'de',
}
const publicationDate = '2022-02-25'

test('languages', () => {
  const chapter = chapterDisplayFactory.build()
  expect(chapter.languages).toEqual(new Set(['en', 'de']))
})

test.each([
  [[], '', false],
  [[], publicationDate, false],
  [[author], '', false],
  [[author], '2022-02-25', true],
])('isPublished', (authors, publicationDate, expected) => {
  const chapter = chapterDisplayFactory.build({
    record: { authors, translators: [], publicationDate },
  })
  expect(chapter.isPublished).toEqual(expected)
})

test('uniqueIdentifier', () => {
  const chapter = chapterDisplayFactory.build()
  expect(chapter.uniqueIdentifier).toEqual(
    `${chapter.id.textId.genre} ${chapter.id.textId.category} ${chapter.id.textId.index} ${chapter.id.stage} ${chapter.id.name}`,
  )
})

test.each([
  [false, true, 'A', true],
  [true, false, 'A', true],
  [false, true, '-', false],
  [true, false, '-', true],
])('fullName', (isSingleStage, expectStage, name, expectName) => {
  const id = chapterIdFactory.build({ name })
  const expectedTextName = 'markdown'
  const textName = `*${expectedTextName}*`
  const chapter = chapterDisplayFactory.build({ id, isSingleStage, textName })
  const expectedStage = expectStage ? ` ${id.stage}` : ''
  const expectedName = expectName ? ` ${id.name}` : ''
  expect(chapter.fullName).toEqual(
    `${expectedTextName} Chapter${expectedStage}${expectedName}`,
  )
})

test('url', () => {
  const chapter = chapterDisplayFactory.build()
  expect(chapter.url).toEqual(
    `https://www.ebl.lmu.de/corpus/${encodeURIComponent(
      chapter.id.textId.genre,
    )}/${encodeURIComponent(chapter.id.textId.category)}/${encodeURIComponent(
      chapter.id.textId.index,
    )}/${encodeURIComponent(
      stageToAbbreviation(chapter.id.stage),
    )}/${encodeURIComponent(chapter.id.name)}`,
  )
})

test.each([false, true])('doi', (textHasDoi) => {
  const chapter = chapterDisplayFactory.build({ textHasDoi })
  expect(chapter.doi).toEqual(
    textHasDoi ? textIdToDoiString(chapter.id.textId) : '',
  )
})

describe.each([true, false])('citation', (textHasDoi) => {
  const today = new Date()
  const chapter = chapterDisplayFactory.build({
    textHasDoi,
    record: { authors: [author], publicationDate },
  })
  const data = chapter.citation.data[0]

  test('id', () => expect(data.id).toEqual(chapter.uniqueIdentifier))

  test('type', () => expect(data.type).toEqual('article-journal'))

  test('title', () => expect(data.title).toEqual(chapter.fullName))

  test('container-title', () =>
    expect(data['container-title']).toEqual('electronic Babylonian Library'))

  test('author', () =>
    expect(data.author).toEqual([
      { family: author.name, given: author.prefix },
    ]))

  test('issued', () =>
    expect(data.issued).toEqual({ 'date-parts': [[2022, 2, 25]] }))

  test('accessed', () =>
    expect(data.accessed).toEqual({
      'date-parts': [
        [today.getFullYear(), today.getMonth() + 1, today.getDate()],
      ],
    }))

  test('URL', () => expect(data.URL).toEqual(chapter.url))

  test('DOI', () =>
    expect(data.DOI).toEqual(textHasDoi ? chapter.doi : undefined))
})

test('getTranslatorsFor', () => {
  const chapter = chapterDisplayFactory.build({
    record: {
      authors: [],
      translators: [deTranslator, enTranslator],
      publicationDate,
    },
  })
  expect(chapter.getTranslatorsOf(enTranslator.language)).toEqual([
    enTranslator,
  ])
})
