import { WordInstances } from 'corpus/application/edit-lite/ChapterEditSource'
import { createManuscriptLine, createVariant, Line } from 'corpus/domain/line'
import { buildEditLiteLines } from 'corpus/ui/edit-lite/editLite.testSupport'
import {
  invalidRequestMessage,
  missingRevisionMessage,
  staleRevisionMessage,
} from 'corpus/ui/edit-lite/EditLiteFakeChapter.testSupport'
import {
  emptyWordMessage,
  missingWordMessage,
  noInstancesMessage,
  sameLemmaMessage,
} from 'corpus/ui/edit-lite/EditLiteFakeInstances.testSupport'
import {
  annotateLine,
  createWordToken,
} from 'corpus/ui/edit-lite/editLiteTokens.testSupport'
import {
  FakeAnnotationRequests,
  openFakeAnnotationRequests,
} from 'corpus/ui/edit-lite/fakeAnnotationRequests.testSupport'

const [firstLine, secondLine, thirdLine] = buildEditLiteLines(3)
const [variant] = annotateLine(thirdLine).variants
const mixedLine: Line = {
  ...thirdLine,
  variants: [
    createVariant({
      ...variant,
      reconstructionTokens: [
        ...variant.reconstructionTokens,
        createWordToken('šapliš', 'AkkadianWord', { uniqueLemma: ['old I'] }),
      ],
      manuscripts: [
        createManuscriptLine({
          ...variant.manuscripts[0],
          atfTokens: [
            createWordToken('šapliš', 'Word', { lemmatizable: false }),
            createWordToken('šapliš', 'Word', { uniqueLemma: ['šapliš I'] }),
          ],
        }),
      ],
    }),
  ],
}
const lines: readonly Line[] = [firstLine, secondLine, mixedLine]
const instancesPath = 'lemmatization/instances'
const savePath = `${instancesPath}?view=outline&revision=revision-1`
const body = { word: 'šapliš', uniqueLemma: ['šapliš I'] }

let requests: FakeAnnotationRequests

function count(word: string, revision = ''): Promise<WordInstances> {
  return requests.get(
    `${instancesPath}?word=${word}${revision}`,
  ) as Promise<WordInstances>
}

beforeEach(() => {
  requests = openFakeAnnotationRequests(lines)
})

test('the lemmatizable words with the clean value are counted in every row of every line', async () => {
  await expect(count('šapliš', '&revision=revision-1')).resolves.toEqual({
    word: 'šapliš',
    words: 4,
    lemmatized: 2,
    lines: [1, 2],
    revision: 'revision-1',
  })
  await expect(count('enūma')).resolves.toMatchObject({
    words: 1,
    lemmatized: 0,
    lines: [0],
  })
  await expect(count('šap-liš')).resolves.toMatchObject({ words: 1 })
  await expect(count('%n')).resolves.toEqual({
    word: '%n',
    words: 0,
    lemmatized: 0,
    lines: [],
    revision: 'revision-1',
  })
})

test.each<[string, string, number, string]>([
  ['without a word', '?revision=revision-1', 422, missingWordMessage],
  ['with an empty word', '?word=', 422, emptyWordMessage],
  [
    'at an old revision',
    '?word=eliš&revision=revision-0',
    409,
    staleRevisionMessage,
  ],
])('a count %s is refused', async (_name, query, status, message) => {
  await requests.expectRefusal(
    requests.get(`${instancesPath}${query}`),
    status,
    message,
  )
})

test('every instance gets the lemma and nothing else is changed', async () => {
  await requests.post(savePath, body)
  const [, storedSecond, storedThird] = requests.chapter.lines
  const [storedVariant] = storedThird.variants

  expect(requests.chapter.revision).toBe('revision-2')
  expect(requests.chapter.lines[0]).toBe(firstLine)
  expect(
    storedSecond.variants.map((stored) =>
      stored.reconstructionTokens.map((token) => token.uniqueLemma),
    ),
  ).toEqual([
    [undefined, ['šapliš I'], undefined, []],
    [undefined, ['šapliš I'], undefined, []],
  ])
  expect(
    storedVariant.reconstructionTokens.map((token) => token.uniqueLemma),
  ).toEqual([undefined, [], ['šapliš I']])
  expect(
    storedVariant.manuscripts[0].atfTokens.map((token) => token.uniqueLemma),
  ).toEqual([[], ['šapliš I']])
  expect(storedVariant.manuscripts[0].atfTokens[0]).toBe(
    mixedLine.variants[0].manuscripts[0].atfTokens[0],
  )
  expect(storedThird.number).toBe('3')
  await expect(count('šapliš')).resolves.toMatchObject({
    words: 4,
    lemmatized: 4,
    revision: 'revision-2',
  })
})

test.each<[string, string, unknown, number, string]>([
  [
    'of a word that is not in the chapter',
    savePath,
    { ...body, word: 'kur' },
    422,
    noInstancesMessage('kur'),
  ],
  [
    'of a word that is never lemmatizable',
    savePath,
    { ...body, word: '%n' },
    422,
    noInstancesMessage('%n'),
  ],
  [
    'without a revision',
    `${instancesPath}?view=outline`,
    body,
    422,
    missingRevisionMessage,
  ],
  [
    'at an old revision',
    `${instancesPath}?view=outline&revision=revision-0`,
    body,
    409,
    staleRevisionMessage,
  ],
  [
    'without a word',
    savePath,
    { uniqueLemma: ['šapliš I'] },
    400,
    invalidRequestMessage,
  ],
  [
    'with an empty word',
    savePath,
    { ...body, word: '' },
    400,
    invalidRequestMessage,
  ],
  [
    'without a lemma',
    savePath,
    { ...body, uniqueLemma: [] },
    400,
    invalidRequestMessage,
  ],
  [
    'with an empty lemma id',
    savePath,
    { ...body, uniqueLemma: [''] },
    400,
    invalidRequestMessage,
  ],
  [
    'with a lemma that is no text',
    savePath,
    { ...body, uniqueLemma: [1] },
    400,
    invalidRequestMessage,
  ],
  [
    'with lemmas that are no list',
    savePath,
    { ...body, uniqueLemma: 'šapliš I' },
    400,
    invalidRequestMessage,
  ],
  [
    'with an unknown field',
    savePath,
    { ...body, lines: [1] },
    400,
    invalidRequestMessage,
  ],
])('a save %s is refused', async (_name, path, sent, status, message) => {
  await requests.expectRefusal(requests.post(path, sent), status, message)
})

test('a save that changes nothing is refused', async () => {
  await requests.post(savePath, body)
  const error = await requests
    .post(`${instancesPath}?view=outline&revision=revision-2`, body)
    .catch((reason: unknown) => reason)

  expect(error).toMatchObject({
    status: 422,
    message: sameLemmaMessage('šapliš', ['šapliš I']),
  })
  expect(requests.chapter.revision).toBe('revision-2')
})
