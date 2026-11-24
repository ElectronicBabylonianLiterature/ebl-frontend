import {
  AnnotationWord,
  findLineToken,
  findNextWord,
  findPreviousWord,
  findWordPosition,
  isSameWord,
  listAlignableWords,
  listLemmatizableWords,
  listSimilarWords,
} from 'corpus/application/edit-lite/annotationWords'
import {
  createLine,
  createManuscriptLine,
  createVariant,
  Line,
} from 'corpus/domain/line'
import {
  annotateLine,
  buildAnnotatedLines,
  createWordToken,
} from 'corpus/ui/edit-lite/editLiteTokens.testSupport'

const [firstLine, secondLine]: readonly Line[] = buildAnnotatedLines(2)
const mixedLine: Line = createLine({
  variants: [
    createVariant({
      reconstructionTokens: [
        createWordToken('kur', 'AkkadianWord'),
        createWordToken('ra', 'AkkadianWord', { lemmatizable: false }),
      ],
      manuscripts: [
        createManuscriptLine({ manuscriptId: 1 }),
        createManuscriptLine({
          manuscriptId: 2,
          atfTokens: [
            createWordToken('kur', 'Word', { alignable: false }),
            createWordToken('ra', 'Word', { lemmatizable: false }),
            createWordToken('kur', 'Word'),
          ],
        }),
      ],
    }),
  ],
})

function word(
  variantIndex: number,
  manuscriptIndex: number | null,
  tokenIndex: number,
): AnnotationWord {
  return { variantIndex, manuscriptIndex, tokenIndex }
}

test('lemmatizable words run through the reconstruction and then the manuscript lines of each variant', () => {
  expect(listLemmatizableWords(firstLine)).toEqual([
    word(0, null, 1),
    word(0, null, 3),
    word(0, 0, 0),
    word(0, 0, 1),
    word(0, 1, 3),
  ])
  expect(listLemmatizableWords(secondLine)).toEqual([
    word(0, null, 1),
    word(0, null, 3),
    word(0, 0, 0),
    word(0, 0, 1),
    word(1, null, 1),
    word(1, null, 3),
  ])
})

test('alignable words run through the manuscript lines of each variant', () => {
  expect(listAlignableWords(firstLine)).toEqual([
    word(0, 0, 0),
    word(0, 0, 1),
    word(0, 1, 3),
  ])
  expect(listAlignableWords(secondLine)).toEqual([word(0, 0, 0), word(0, 0, 1)])
})

test('words that cannot be annotated and manuscript lines without words are left out', () => {
  expect(listLemmatizableWords(mixedLine)).toEqual([
    word(0, null, 0),
    word(0, 1, 0),
    word(0, 1, 2),
  ])
  expect(listAlignableWords(mixedLine)).toEqual([word(0, 1, 1), word(0, 1, 2)])
  expect(listAlignableWords(annotateLine(createLine({})))).toEqual([])
  expect(listLemmatizableWords(createLine({}))).toEqual([])
})

test('the next word ends with the last one and the previous word stops at the first', () => {
  expect(findNextWord(3, 0)).toBe(1)
  expect(findNextWord(3, 1)).toBe(2)
  expect(findNextWord(3, 2)).toBeNull()
  expect(findNextWord(0, 0)).toBeNull()
  expect(findPreviousWord(2)).toBe(1)
  expect(findPreviousWord(1)).toBe(0)
  expect(findPreviousWord(0)).toBe(0)
})

test('a word is found by its variant, its row and its token', () => {
  const words = listLemmatizableWords(secondLine)

  expect(findWordPosition(words, word(1, null, 3))).toBe(5)
  expect(findWordPosition(words, word(0, 0, 1))).toBe(3)
  expect(findWordPosition(words, word(0, null, 0))).toBeNull()
  expect(findWordPosition(words, word(0, 1, 1))).toBeNull()
  expect(findWordPosition(words, word(2, null, 1))).toBeNull()
  expect(isSameWord(word(0, null, 1), word(0, null, 1))).toBe(true)
  expect(isSameWord(word(0, null, 1), word(0, 0, 1))).toBe(false)
  expect(findLineToken(secondLine, word(1, null, 3)).value).toBe('erṣetu')
  expect(findLineToken(secondLine, word(0, 0, 1)).value).toBe('am-ma-tu')
})

test('the instances of a word in a line are the words with its clean value', () => {
  const words = listLemmatizableWords(secondLine)

  expect(listSimilarWords(secondLine, words, word(1, null, 1))).toEqual([
    word(0, null, 1),
    word(1, null, 1),
  ])
  expect(listSimilarWords(secondLine, words, word(0, 0, 0))).toEqual([
    word(0, 0, 0),
  ])
  expect(
    listSimilarWords(
      mixedLine,
      listLemmatizableWords(mixedLine),
      word(0, 1, 2),
    ),
  ).toEqual([word(0, null, 0), word(0, 1, 0), word(0, 1, 2)])
})
