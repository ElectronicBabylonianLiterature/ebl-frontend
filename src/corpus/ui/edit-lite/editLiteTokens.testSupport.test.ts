import { createLine, createVariant, Line } from 'corpus/domain/line'
import { buildEditLiteLines } from 'corpus/ui/edit-lite/editLite.testSupport'
import {
  annotateLine,
  buildAnnotatedLines,
  buildLineLemmatization,
  createWordToken,
  tokenizeManuscriptLine,
  tokenizeReconstruction,
} from 'corpus/ui/edit-lite/editLiteTokens.testSupport'
import { isAnyWord } from 'transliteration/domain/type-guards'

const [firstLine, secondLine]: readonly Line[] = buildEditLiteLines(2)

test('a reconstruction is split into shifts, separators and normalized words', () => {
  const tokens = tokenizeReconstruction('%n enūma | eliš (||) lā\n#note: a')

  expect(tokens.map((token) => [token.type, token.value])).toEqual([
    ['LanguageShift', '%n'],
    ['AkkadianWord', 'enūma'],
    ['MetricalFootSeparator', '|'],
    ['AkkadianWord', 'eliš'],
    ['MetricalFootSeparator', '(||)'],
    ['AkkadianWord', 'lā'],
  ])
  expect(tokens[1]).toMatchObject({
    cleanValue: 'enūma',
    normalized: true,
    lemmatizable: true,
    alignable: true,
    alignment: null,
    uniqueLemma: [],
    modifiers: [],
  })
  expect(tokens.map((token) => isAnyWord(token))).toEqual([
    false,
    true,
    false,
    true,
    false,
    true,
  ])
})

test('a manuscript line is split into words and broken text', () => {
  const tokens = tokenizeManuscriptLine('[x x] e#-nu-ma? ... e-liš\n$ break')

  expect(tokens.map((token) => [token.type, token.value])).toEqual([
    ['UnknownNumberOfSigns', '[x'],
    ['UnknownNumberOfSigns', 'x]'],
    ['Word', 'e#-nu-ma?'],
    ['UnknownNumberOfSigns', '...'],
    ['Word', 'e-liš'],
  ])
  expect(tokens[2]).toMatchObject({
    cleanValue: 'e-nu-ma',
    normalized: false,
    lemmatizable: true,
  })
  expect(tokens[2]).not.toHaveProperty('modifiers')
  expect(tokens[0].lemmatizable).toBeUndefined()
  expect(tokenizeManuscriptLine('')).toEqual([])
})

test('a word token takes the given properties', () => {
  expect(
    createWordToken('kur', 'Word', { language: 'SUMERIAN' }),
  ).toMatchObject({ value: 'kur', type: 'Word', language: 'SUMERIAN' })
})

test('a line gets the tokens of its text and keeps the tokens it has', () => {
  const annotated = annotateLine(secondLine)
  const [firstVariant, secondVariant] = annotated.variants

  expect(annotated).toMatchObject({
    number: '2',
    translation: '#tr.en: Nor below',
  })
  expect(firstVariant.reconstructionTokens).toEqual(
    tokenizeReconstruction('%n šapliš | ammatu'),
  )
  expect(firstVariant.manuscripts[0]).toMatchObject({
    manuscriptId: 1,
    labels: ['o'],
    number: '2',
    atf: 'šap-liš am-ma-tu',
    atfTokens: tokenizeManuscriptLine('šap-liš am-ma-tu'),
  })
  expect(secondVariant.manuscripts).toEqual([])
  expect(annotateLine(annotated)).toEqual(annotated)
  expect(annotateLine(annotated).variants[0].reconstructionTokens).toBe(
    firstVariant.reconstructionTokens,
  )
  expect(annotateLine(annotated).variants[0].manuscripts[0]).toBe(
    firstVariant.manuscripts[0],
  )
})

test('annotated lines are the line fixtures with tokens', () => {
  expect(buildAnnotatedLines(2)).toEqual([
    annotateLine(firstLine),
    annotateLine(secondLine),
  ])
  expect(buildAnnotatedLines()).toHaveLength(3)
})

test('the lemmatization of a line without lemmas lists its tokens', () => {
  const [[reconstruction, manuscripts]] = buildLineLemmatization(firstLine)

  expect(
    reconstruction.map((token) => [token.value, token.lemmatizable]),
  ).toEqual([
    ['%n', false],
    ['enūma', true],
    ['|', false],
    ['eliš', true],
  ])
  expect(reconstruction[1]).toMatchObject({ uniqueLemma: [], suggestions: [] })
  expect(
    manuscripts.map((tokens) => tokens.map((token) => token.value)),
  ).toEqual([
    ['e-nu-ma', 'e-liš'],
    ['[x', 'x', 'x]', 'e-li-iš'],
  ])
  expect(
    buildLineLemmatization(createLine({ variants: [createVariant({})] })),
  ).toEqual([[[], []]])
})
