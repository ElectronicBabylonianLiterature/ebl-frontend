import { annotationsNotAvailableMessage } from 'corpus/application/edit-lite/chapterChangeMessages'
import { createLineAlignment, Line } from 'corpus/domain/line'
import { setAlignmentToken, setOmittedWords } from 'corpus/domain/alignment'
import { setReconstructionLemma } from 'corpus/domain/lemmatization'
import Word from 'dictionary/domain/Word'
import {
  emptyWordMessage,
  sameLemmaMessage,
} from 'corpus/ui/edit-lite/EditLiteFakeInstances.testSupport'
import {
  buildEditLiteLines,
  createFakeChapterEditSource,
} from 'corpus/ui/edit-lite/editLite.testSupport'
import { countMismatchMessage } from 'corpus/ui/edit-lite/EditLiteFakeAnnotations.testSupport'
import {
  annotateLine,
  buildDictionaryWord,
} from 'corpus/ui/edit-lite/editLiteTokens.testSupport'
import Lemma from 'transliteration/domain/Lemma'

const lines: readonly Line[] = buildEditLiteLines(3)
const enuma: Word = buildDictionaryWord('enūma')
const elish: Word = buildDictionaryWord('eliš')
const dictionary = {
  words: [enuma, elish],
  suggestions: [{ word: 'eliš', isNormalized: true, lemmas: [['eliš I']] }],
}

test('the fake source serves a line with its tokens', async () => {
  const source = createFakeChapterEditSource({ lines })

  await expect(source.loadAnnotatedLine(1)).resolves.toEqual(
    annotateLine(lines[1]),
  )
  await expect(source.loadLines(1, 1)).resolves.toEqual([lines[1]])
})

test('the fake legacy source has no tokens', async () => {
  const source = createFakeChapterEditSource({ lines, kind: 'legacy' })

  await expect(source.loadAnnotatedLine(0)).rejects.toThrow(
    new Error(annotationsNotAvailableMessage),
  )
})

test('the fake source stores an alignment on its line only', async () => {
  const source = createFakeChapterEditSource({ lines })
  const [[first, second]] = createLineAlignment(annotateLine(lines[0]))

  const outline = await source.saveAlignment(0, [
    [
      setAlignmentToken(setOmittedWords(first, [3]), 1, {
        ...first.alignment[1],
        suggested: false,
      }),
      second,
    ],
  ])
  const saved = await source.loadAnnotatedLine(0)

  expect(outline.lines.map((line) => line.number)).toEqual(['1', '2', '3'])
  expect(saved.variants[0].manuscripts[0].omittedWords).toEqual([3])
  expect(
    saved.variants[0].manuscripts[0].atfTokens.map((token) => token.alignment),
  ).toEqual([null, 3])
  await expect(source.loadLines(1, 2)).resolves.toEqual(lines.slice(1))
})

test('the fake source is as strict as the endpoint', async () => {
  const source = createFakeChapterEditSource({ lines })

  expect(() => source.saveAlignment(0, [])).toThrow(
    countMismatchMessage('variants', 1, 0),
  )
  expect(() => source.saveLemmatization(0, [])).toThrow(
    countMismatchMessage('variants', 1, 0),
  )
  await expect(source.loadAnnotatedLine(0)).resolves.toEqual(
    annotateLine(lines[0]),
  )
})

test('the fake source suggests, stores and serves lemmas', async () => {
  const source = createFakeChapterEditSource({ lines, ...dictionary })
  const annotatedLine = await source.loadAnnotatedLine(0)
  const [lemmatization] = await source.loadLemmatization(annotatedLine)

  expect(lemmatization[0][3]).toMatchObject({
    uniqueLemma: [new Lemma(elish)],
    suggested: true,
  })

  await source.saveLemmatization(0, [
    setReconstructionLemma(lemmatization, annotatedLine.variants[0], 1, [
      new Lemma(enuma),
    ]),
  ])
  const savedLine = await source.loadAnnotatedLine(0)
  const [[reconstruction]] = await source.loadLemmatization(savedLine)

  expect(
    savedLine.variants[0].reconstructionTokens.map(
      (token) => token.uniqueLemma,
    ),
  ).toEqual([undefined, ['enūma I'], undefined, []])
  expect(reconstruction.map((token) => token.uniqueLemma)).toEqual([
    null,
    [new Lemma(enuma)],
    null,
    [new Lemma(elish)],
  ])
  expect(reconstruction[3].suggested).toBe(true)
  await expect(source.loadLines(1, 2)).resolves.toEqual(lines.slice(1))
})

test('the fake source searches its dictionary', async () => {
  const source = createFakeChapterEditSource({ lines, ...dictionary })

  await expect(source.searchLemma('el')).resolves.toEqual([elish])
  await expect(
    createFakeChapterEditSource({ lines }).searchLemma('el'),
  ).resolves.toEqual([])
})

test.each([[{ kind: 'legacy' } as const], [{ canSave: false } as const]])(
  'the fake source %o does not store annotations',
  async (options) => {
    const source = createFakeChapterEditSource({ lines, ...options })
    const annotatedLine = annotateLine(lines[0])

    await expect(
      source.saveAlignment(0, createLineAlignment(annotatedLine)),
    ).rejects.toThrow('Saving is not available.')
    await expect(
      source.saveLemmatization(
        0,
        await source.loadLemmatization(annotatedLine),
      ),
    ).rejects.toThrow('Saving is not available.')
  },
)

test('the fake source counts and lemmatizes the instances of a word and creates proper nouns', async () => {
  const source = createFakeChapterEditSource({ lines, ...dictionary })

  await expect(source.countWordInstances('eliš')).resolves.toEqual({
    word: 'eliš',
    words: 1,
    lemmatized: 0,
    lines: [0],
    revision: 'revision-1',
  })
  await expect(source.countWordInstances('')).rejects.toThrow(emptyWordMessage)

  await source.lemmatizeWordInstances('eliš', ['eliš I'])
  const created = await source.createProperNoun('Marduk', 'DN')

  await expect(source.countWordInstances('eliš')).resolves.toMatchObject({
    lemmatized: 1,
  })
  await expect(
    source.lemmatizeWordInstances('eliš', ['eliš I']),
  ).rejects.toThrow(sameLemmaMessage('eliš', ['eliš I']))
  expect(created).toMatchObject({ _id: 'Marduk DN', namedEntityTags: ['DN'] })
  await expect(source.searchLemma('Mar')).resolves.toEqual([created])
  await expect(source.loadLines(1, 2)).resolves.toEqual(lines.slice(1))
})
