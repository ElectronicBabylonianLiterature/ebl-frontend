import { LineOutline } from 'corpus/application/edit-lite/chapterOutline'
import {
  countManuscriptLines,
  firstRow,
  pluralize,
  stripTranslationPrefix,
  summarizeReconstruction,
  summarizeTranslation,
} from 'corpus/ui/edit-lite/lineSummary'

const line: LineOutline = {
  index: 0,
  number: '1',
  isSecondLineOfParallelism: false,
  isBeginningOfSection: false,
  translation: '#tr.en: When on high\n#tr.ar: second translation',
  variants: [
    { reconstruction: '%n enūma | eliš\n#note: a note', manuscriptIds: [1, 2] },
    { reconstruction: '%n enūma', manuscriptIds: [3] },
  ],
}
const emptyLine: LineOutline = { ...line, translation: '', variants: [] }

test.each([
  ['first\nsecond', 'first'],
  ['only', 'only'],
  ['', ''],
])('firstRow(%j)', (text, expected) => {
  expect(firstRow(text)).toBe(expected)
})

test.each([
  ['#tr.en: When on high', 'When on high'],
  ['#tr.de.(2):Als droben', 'Als droben'],
  ['no prefix: here', 'no prefix: here'],
])('stripTranslationPrefix(%j)', (row, expected) => {
  expect(stripTranslationPrefix(row)).toBe(expected)
})

test('summarizeReconstruction is the first row of the first variant', () => {
  expect(summarizeReconstruction(line)).toBe('%n enūma | eliš')
  expect(summarizeReconstruction(emptyLine)).toBe('')
})

test('summarizeTranslation is the first translation without its prefix', () => {
  expect(summarizeTranslation(line)).toBe('When on high')
  expect(summarizeTranslation(emptyLine)).toBe('')
})

test('countManuscriptLines counts the manuscript lines of all variants', () => {
  expect(countManuscriptLines(line)).toBe(3)
  expect(countManuscriptLines(emptyLine)).toBe(0)
})

test.each([
  [0, '0 variants'],
  [1, '1 variant'],
  [2, '2 variants'],
])('pluralize(%i)', (count, expected) => {
  expect(pluralize(count, 'variant')).toBe(expected)
})
