import _ from 'lodash'
import { toLineDto } from 'corpus/application/chapterDtoSerialization'
import { ChapterOutline } from 'corpus/application/edit-lite/chapterOutline'
import { toLineEditsDto } from 'corpus/application/edit-lite/lineEdits'
import { Line } from 'corpus/domain/line'
import {
  buildEditLiteLines,
  buildEditLiteOutline,
} from 'corpus/ui/edit-lite/editLite.testSupport'
import { annotateLine } from 'corpus/ui/edit-lite/editLiteTokens.testSupport'
import {
  FakeAnnotationRequests,
  openFakeAnnotationRequests,
} from 'corpus/ui/edit-lite/fakeAnnotationRequests.testSupport'
import { setLineTranslation } from 'corpus/ui/edit-lite/lineDraft'

const lines: readonly Line[] = buildEditLiteLines(3)

let requests: FakeAnnotationRequests

function saveLemma(): Promise<unknown> {
  return requests.save('lemmatization', (body) => {
    _.set(body, 'lemmatization[0].reconstruction[1].uniqueLemma', ['enūma I'])
    _.set(body, 'lemmatization[0].manuscripts[1][3].uniqueLemma', ['eliš I'])
    _.unset(body, 'lemmatization[0].manuscripts[0][0].uniqueLemma')
  })
}

beforeEach(() => {
  requests = openFakeAnnotationRequests(lines)
})

test('lines are served with their tokens only when tokens are asked for', async () => {
  const { chapter, get, loadAnnotatedLine } = requests
  const plainPage = await get('lines?offset=0&limit=1&revision=revision-1')

  await expect(loadAnnotatedLine(0)).resolves.toEqual(annotateLine(lines[0]))
  expect(plainPage).toMatchObject({ lines: [toLineDto(lines[0])] })
  expect(JSON.stringify(plainPage)).not.toContain('Tokens')
  expect(chapter.lines).toBe(lines)
})

test('a saved alignment is stored on its line and served again', async () => {
  const { chapter, save, loadAnnotatedLine } = requests
  const outline = (await save('alignment', (body) => {
    _.set(body, 'alignment[0][0].omittedWords', [3])
    _.assign(_.get(body, 'alignment[0][0].alignment[0]'), {
      alignment: 3,
      variant: 'e-nu',
      type: 'AkkadianWord',
      language: 'AKKADIAN',
    })
    _.assign(_.get(body, 'alignment[0][0].alignment[1]'), {
      alignment: null,
      variant: 'e',
    })
    _.unset(body, 'alignment[0][0].alignment[1].type')
  })) as ChapterOutline
  const [first, second] = (await loadAnnotatedLine(0)).variants[0].alignment

  expect(outline).toEqual(buildEditLiteOutline(lines, 'revision-2'))
  expect(chapter.lines[1]).toBe(lines[1])
  expect(chapter.lines[2]).toBe(lines[2])
  expect(first.omittedWords).toEqual([3])
  expect(first.alignment).toEqual([
    {
      value: 'e-nu-ma',
      alignment: 3,
      variant: { value: 'e-nu', type: 'AkkadianWord', language: 'AKKADIAN' },
      isAlignable: true,
      suggested: false,
    },
    {
      value: 'e-liš',
      alignment: null,
      variant: { value: 'e', type: 'Word', language: '' },
      isAlignable: true,
      suggested: false,
    },
  ])
  expect(second.alignment[3]).toMatchObject({ alignment: 3, suggested: false })
})

test('a saved lemmatization is stored on its line and served again', async () => {
  const { chapter, loadAnnotatedLine } = requests
  await saveLemma()
  const [variant] = (await loadAnnotatedLine(0)).variants

  expect(chapter.revision).toBe('revision-2')
  expect(
    variant.reconstructionTokens.map((token) => token.uniqueLemma),
  ).toEqual([undefined, ['enūma I'], undefined, []])
  expect(
    variant.manuscripts.map((manuscript) =>
      manuscript.atfTokens.map((token) => token.uniqueLemma),
    ),
  ).toEqual([
    [[], []],
    [undefined, undefined, undefined, ['eliš I']],
  ])
  expect(chapter.lines[2]).toBe(lines[2])
})

test('an alignment and a lemmatization of one line are both kept', async () => {
  const { save, loadAnnotatedLine } = requests
  await save('alignment')
  await saveLemma()
  const [variant] = (await loadAnnotatedLine(0)).variants

  expect(variant.manuscripts[1].atfTokens[3]).toMatchObject({
    alignment: 3,
    uniqueLemma: ['eliš I'],
  })
})

test('a text save keeps the annotation of the text that did not change', async () => {
  const { chapter, post, save } = requests
  await save('alignment')
  const [stored] = chapter.lines[0].variants
  const edited = setLineTranslation(lines[0], '#tr.en: changed')

  await post(
    'lines?view=outline&revision=revision-2',
    toLineEditsDto(0, edited),
  )
  const [kept] = chapter.lines[0].variants

  expect(chapter.lines[0].translation).toBe('#tr.en: changed')
  expect(kept.reconstructionTokens).toBe(stored.reconstructionTokens)
  expect(kept.manuscripts.map((manuscript) => manuscript.atfTokens)).toEqual(
    stored.manuscripts.map((manuscript) => manuscript.atfTokens),
  )
})

test('a text save drops the tokens of the text that changed', async () => {
  const { chapter, post, save } = requests
  await save('alignment')
  const [stored] = chapter.lines[0].variants
  const [variant] = toLineDto(lines[0]).variants
  const [firstManuscript, secondManuscript] = variant.manuscripts

  await post('lines?view=outline&revision=revision-2', {
    new: [toLineDto(lines[1])],
    deleted: [],
    edited: [
      {
        index: 0,
        line: {
          ...toLineDto(lines[0]),
          variants: [
            {
              ...variant,
              reconstruction: '%n enūma',
              manuscripts: [
                firstManuscript,
                { ...secondManuscript, atf: 'e-li-iš' },
                firstManuscript,
              ],
            },
            variant,
          ],
        },
      },
    ],
  })
  const [changed, added] = chapter.lines[0].variants

  expect(changed.reconstructionTokens).toEqual([])
  expect(changed.manuscripts.map((manuscript) => manuscript.atfTokens)).toEqual(
    [stored.manuscripts[0].atfTokens, [], []],
  )
  expect(added.reconstructionTokens).toEqual([])
  expect(chapter.lines[3].variants[0].reconstructionTokens).toEqual([])
})
