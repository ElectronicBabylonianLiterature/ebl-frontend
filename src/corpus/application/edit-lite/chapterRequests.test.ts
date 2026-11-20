import { toManuscriptsDto } from 'corpus/application/chapterDtoSerialization'
import { ChapterChange } from 'corpus/application/edit-lite/ChapterEditSource'
import { editChapterId } from 'corpus/application/edit-lite/chapterEditSource.testSupport'
import {
  createChapterEndpointUrl,
  createChapterUpdateUrl,
  describeChapterChange,
  toChapterUpdate,
} from 'corpus/application/edit-lite/chapterRequests'
import {
  toDeletedLineDto,
  toLineEditsDto,
  toNewLineDto,
} from 'corpus/application/edit-lite/lineEdits'
import { createLine, EditStatus, Line } from 'corpus/domain/line'
import { Manuscript } from 'corpus/domain/manuscript'

const chapterUrl = '/texts/L/1/2/chapters/Standard%20Babylonian/I'
const line: Line = createLine({ number: '7', status: EditStatus.NEW })
const manuscripts: readonly Manuscript[] = [
  new Manuscript({ id: 1, siglumDisambiguator: '1a' }),
]
const atf = '1. kur\n2. ra'

const changes: readonly [ChapterChange, string, unknown][] = [
  [{ type: 'saveLine', index: 3, line }, 'lines', toLineEditsDto(3, line)],
  [{ type: 'addLine', line }, 'lines', toNewLineDto(line)],
  [{ type: 'deleteLine', index: 5 }, 'lines', toDeletedLineDto(5)],
  [{ type: 'importLines', atf }, 'import', { atf }],
  [
    { type: 'saveManuscripts', manuscripts, uncertainFragments: ['K.1'] },
    'manuscripts',
    toManuscriptsDto(manuscripts, ['K.1']),
  ],
]

describe('createChapterEndpointUrl', () => {
  it('appends the endpoint and the parameters in the given order', () => {
    expect(
      createChapterEndpointUrl(editChapterId, 'lines', {
        offset: 20,
        limit: 2,
        revision: 'revision 7/a',
      }),
    ).toBe(`${chapterUrl}/lines?offset=20&limit=2&revision=revision%207%2Fa`)
  })

  it.each([[undefined], ['']])('omits the empty parameter %p', (revision) => {
    expect(
      createChapterEndpointUrl(editChapterId, 'import', {
        offset: 0,
        revision,
      }),
    ).toBe(`${chapterUrl}/import?offset=0`)
  })
})

describe('createChapterUpdateUrl', () => {
  it.each(['lines', 'import', 'manuscripts'] as const)(
    'asks the %s endpoint for the outline of the given revision',
    (endpoint) => {
      expect(
        createChapterUpdateUrl(editChapterId, endpoint, 'revision-4'),
      ).toBe(`${chapterUrl}/${endpoint}?view=outline&revision=revision-4`)
    },
  )

  it('omits an unknown revision', () => {
    expect(createChapterUpdateUrl(editChapterId, 'manuscripts')).toBe(
      `${chapterUrl}/manuscripts?view=outline`,
    )
  })
})

describe.each(changes)('the change %j', (change, endpoint, body) => {
  it('goes to its endpoint with its body', () => {
    expect(toChapterUpdate(change)).toEqual({ endpoint, body })
  })

  it('is described as the request that would be sent', () => {
    expect(describeChapterChange(editChapterId, change, 'revision-4')).toEqual({
      method: 'POST',
      url: `${chapterUrl}/${endpoint}?view=outline&revision=revision-4`,
      body,
    })
  })

  it('is described without a revision when none is known', () => {
    expect(describeChapterChange(editChapterId, change).url).toBe(
      `${chapterUrl}/${endpoint}?view=outline`,
    )
  })
})

it('sends the line of an added line under new only', () => {
  expect(toChapterUpdate({ type: 'addLine', line }).body).toEqual({
    new: [
      {
        number: '7',
        variants: [],
        isSecondLineOfParallelism: false,
        isBeginningOfSection: false,
        translation: '',
      },
    ],
    deleted: [],
    edited: [],
  })
})

it('sends the index of a deleted line under deleted only', () => {
  expect(toChapterUpdate({ type: 'deleteLine', index: 5 }).body).toEqual({
    new: [],
    deleted: [5],
    edited: [],
  })
})
