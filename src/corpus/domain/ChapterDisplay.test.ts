import {
  chapterDisplayFactory,
  chapterIdFactory,
} from 'test-support/chapter-fixtures'
import { Author } from 'corpus/domain/chapter'

const author: Author = {
  name: 'name',
  prefix: '',
  role: 'EDITOR',
  orcidNumber: '',
}
const publicationDate = '2022-02-25'

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
    `${chapter.id.textId.genre} ${chapter.id.textId.category} ${chapter.id.textId.index} ${chapter.id.stage} ${chapter.id.name}`
  )
})

test.each([
  [false, true, 'A', true],
  [true, false, 'A', true],
  [false, true, '-', false],
  [true, false, '-', true],
])('fullName', (isSingleStage, expectStage, name, expectName) => {
  const id = chapterIdFactory.build({ name })
  const chapter = chapterDisplayFactory.build({ id, isSingleStage })
  const expectedStage = expectStage ? ` ${id.stage}` : ''
  const expectedName = expectName ? ` ${id.name}` : ''
  expect(chapter.fullName).toEqual(
    `${chapter.textName} Chapter${expectedStage}${expectedName}`
  )
})

test('url', () => {
  const chapter = chapterDisplayFactory.build()
  expect(chapter.url).toEqual(
    `https://www.ebl.lmu.de/corpus/${encodeURIComponent(
      chapter.id.textId.genre
    )}/${encodeURIComponent(chapter.id.textId.category)}/${encodeURIComponent(
      chapter.id.textId.index
    )}/${encodeURIComponent(chapter.id.stage)}/${encodeURIComponent(
      chapter.id.name
    )}`
  )
})

describe('citation', () => {
  const today = new Date()
  const chapter = chapterDisplayFactory.build({
    record: { authors: [author], publicationDate },
  })
  const data = chapter.citation.data[0]

  test('id', () => expect(data.id).toEqual(chapter.uniqueIdentifier))

  test('type', () => expect(data.type).toEqual('article-journal'))

  test('title', () => expect(data.title).toEqual(chapter.fullName))

  test('container-title', () =>
    expect(data['container-title']).toEqual('electronic Babylonian Literature'))

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
})
