import _ from 'lodash'
import { Line } from 'corpus/domain/line'
import { buildEditLiteLines } from 'corpus/ui/edit-lite/editLite.testSupport'
import {
  countMismatchMessage,
  duplicateAlignmentMessage,
  notAlignableMessage,
  notLemmatizableMessage,
  valueMismatchMessage,
} from 'corpus/ui/edit-lite/EditLiteFakeAnnotations.testSupport'
import {
  missingRevisionMessage,
  emptyRevisionMessage,
  invalidRequestMessage,
  positionOutOfRangeMessage,
  staleRevisionMessage,
} from 'corpus/ui/edit-lite/EditLiteFakeChapter.testSupport'
import {
  Annotation,
  BodyChange,
  buildAnnotationPath,
  FakeAnnotationRequests,
  openFakeAnnotationRequests,
} from 'corpus/ui/edit-lite/fakeAnnotationRequests.testSupport'

type Edit = [string, unknown]

const lines: readonly Line[] = buildEditLiteLines(3)
const firstToken = 'alignment[0][0].alignment[0]'
const variantLemmas = 'lemmatization[0]'

let requests: FakeAnnotationRequests

function set(path: string, value: unknown): BodyChange {
  return (body) => _.set(body, path, value)
}

function unset(path: string): BodyChange {
  return (body) => _.unset(body, path)
}

beforeEach(() => {
  requests = openFakeAnnotationRequests(lines)
})

describe.each<Annotation>(['alignment', 'lemmatization'])('a %s', (name) => {
  test.each<[string, string, number, string]>([
    ['without a revision', '', 422, missingRevisionMessage],
    ['with an empty revision', '&revision=', 422, emptyRevisionMessage],
    ['at an old revision', '&revision=revision-0', 409, staleRevisionMessage],
  ])('%s is refused', async (_name, query, status, message) => {
    const { bodies, expectRefusal, post } = requests
    await expectRefusal(
      post(`lines/0/${name}?view=outline${query}`, bodies[name]),
      status,
      message,
    )
  })

  test('of a line that does not exist is refused', async () => {
    const { bodies, expectRefusal, post } = requests
    await expectRefusal(
      post(buildAnnotationPath(name, 3, 'revision-1'), bodies[name]),
      422,
      positionOutOfRangeMessage(3, 3),
    )
  })

  test('is not served for another method, view or position', async () => {
    const { bodies, chapter, get, post } = requests
    await expect(
      get(buildAnnotationPath(name, 0, 'revision-1')),
    ).rejects.toThrow('Unexpected')
    await expect(
      post(`lines/0/${name}?revision=revision-1`, bodies[name]),
    ).rejects.toThrow('Unexpected postJson')
    await expect(
      post(buildAnnotationPath(name, -1, 'revision-1'), bodies[name]),
    ).rejects.toThrow('Unexpected postJson')
    expect(chapter.lines).toBe(lines)
  })

  test.each<Edit>([
    ['is a list', []],
    ['has no variants', {}],
    ['has an unknown field', { [name]: [], revision: 'revision-1' }],
    ['lists variants that are text', { [name]: ['variant'] }],
  ])('with a body that %s is malformed', async (_name, body) => {
    const { expectRefusal, post } = requests
    await expectRefusal(
      post(buildAnnotationPath(name, 0, 'revision-1'), body),
      400,
      invalidRequestMessage,
    )
  })
})

test.each<[Annotation, string, BodyChange]>([
  ['alignment', 'no omitted words', unset('alignment[0][0].omittedWords')],
  [
    'alignment',
    'an omitted word -1',
    set('alignment[0][0].omittedWords', [-1]),
  ],
  ['alignment', 'a token without a value', unset(`${firstToken}.value`)],
  ['alignment', 'an unknown token field', set(`${firstToken}.suggested`, true)],
  ['alignment', 'a position as text', set(`${firstToken}.alignment`, '1')],
  ['alignment', 'a variant that is null', set(`${firstToken}.variant`, null)],
  ['lemmatization', 'no manuscripts', unset(`${variantLemmas}.manuscripts`)],
  [
    'lemmatization',
    'a token without a value',
    unset(`${variantLemmas}.reconstruction[0].value`),
  ],
  [
    'lemmatization',
    'a lemma as text',
    set(`${variantLemmas}.reconstruction[1].uniqueLemma`, 'enūma I'),
  ],
  [
    'lemmatization',
    'an unknown token field',
    set(`${variantLemmas}.manuscripts[0][0].suggested`, true),
  ],
])('a %s with %s is malformed', async (name, _name, change) => {
  const { expectRefusal, save } = requests
  await expectRefusal(save(name, change), 400, invalidRequestMessage)
})

test.each<[Annotation, string, BodyChange, string]>([
  [
    'alignment',
    'another variant',
    set('alignment[1]', []),
    countMismatchMessage('variants', 1, 2),
  ],
  [
    'alignment',
    'no manuscript lines',
    set('alignment[0]', []),
    countMismatchMessage('manuscript lines', 2, 0),
  ],
  [
    'alignment',
    'no tokens',
    set('alignment[0][0].alignment', []),
    countMismatchMessage('tokens', 2, 0),
  ],
  [
    'alignment',
    'another token value',
    set('alignment[0][0].alignment[1].value', 'e-li-iš'),
    valueMismatchMessage('e-liš', 'e-li-iš'),
  ],
  [
    'alignment',
    'an aligned broken sign',
    set('alignment[0][1].alignment[0].alignment', 1),
    notAlignableMessage,
  ],
  [
    'alignment',
    'two words on one word',
    set(`${firstToken}.alignment`, 3),
    duplicateAlignmentMessage,
  ],
  [
    'lemmatization',
    'no variant',
    set('lemmatization', []),
    countMismatchMessage('variants', 1, 0),
  ],
  [
    'lemmatization',
    'another manuscript line',
    set(`${variantLemmas}.manuscripts[2]`, []),
    countMismatchMessage('manuscript lines', 2, 3),
  ],
  [
    'lemmatization',
    'another reconstruction word',
    set(`${variantLemmas}.reconstruction[4]`, { value: 'ilū' }),
    countMismatchMessage('tokens', 4, 5),
  ],
  [
    'lemmatization',
    'another manuscript token value',
    set(`${variantLemmas}.manuscripts[1][0].value`, 'x'),
    valueMismatchMessage('[x', 'x'),
  ],
  [
    'lemmatization',
    'a lemma on a separator',
    set(`${variantLemmas}.reconstruction[2].uniqueLemma`, ['u I']),
    notLemmatizableMessage,
  ],
])(
  'a %s with %s does not fit the line',
  async (name, _name, change, message) => {
    const { expectRefusal, save } = requests
    await expectRefusal(save(name, change), 422, message)
  },
)
