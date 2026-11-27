import {
  createLine,
  createManuscriptLine,
  createVariant,
  EditStatus,
  Line,
  LineVariant,
  ManuscriptLine,
} from 'corpus/domain/line'
import {
  formatLabels,
  parseLabels,
  setBeginningOfSection,
  setLineNumber,
  setLineTranslation,
  setLineVariant,
  setManuscriptAtf,
  setManuscriptId,
  setManuscriptLabels,
  setManuscriptNumber,
  setSecondLineOfParallelism,
  setVariantIntertext,
  setVariantManuscriptLine,
  setVariantReconstruction,
} from 'corpus/ui/edit-lite/lineDraft'

const manuscriptLine: ManuscriptLine = createManuscriptLine({
  manuscriptId: 1,
  labels: ['o'],
  number: '1',
  atf: 'kur',
})
const otherManuscriptLine: ManuscriptLine = createManuscriptLine({
  manuscriptId: 2,
  number: '2',
  atf: 'ra',
})
const variant: LineVariant = createVariant({
  reconstruction: 'kur',
  intertext: 'intertext',
  manuscripts: [manuscriptLine, otherManuscriptLine],
})
const otherVariant: LineVariant = createVariant({ reconstruction: 'ra' })
const line: Line = createLine({
  number: '1',
  translation: '#tr.en: mountain',
  variants: [variant, otherVariant],
})

test.each<[string, Line, Partial<Line>]>([
  ['setLineNumber', setLineNumber(line, '2'), { number: '2' }],
  [
    'setLineTranslation',
    setLineTranslation(line, '#tr.en: land'),
    { translation: '#tr.en: land' },
  ],
  [
    'setSecondLineOfParallelism',
    setSecondLineOfParallelism(line, true),
    { isSecondLineOfParallelism: true },
  ],
  [
    'setBeginningOfSection',
    setBeginningOfSection(line, true),
    { isBeginningOfSection: true },
  ],
])('%s changes the line and marks it as edited', (_name, changed, expected) => {
  expect(changed).toEqual({ ...line, ...expected, status: EditStatus.EDITED })
  expect(changed.variants).toBe(line.variants)
  expect(line.status).toBe(EditStatus.CLEAN)
})

test('setLineVariant replaces one variant and shares the others', () => {
  const changedVariant = setVariantReconstruction(otherVariant, 'ra-am')
  const changed = setLineVariant(line, 1, changedVariant)

  expect(changed.variants).toEqual([variant, changedVariant])
  expect(changed.variants[0]).toBe(variant)
  expect(changed.status).toBe(EditStatus.EDITED)
})

test('a new line stays new when it is edited', () => {
  const newLine = createLine({ status: EditStatus.NEW })

  expect(setLineNumber(newLine, '1').status).toBe(EditStatus.NEW)
})

test('setVariantIntertext', () => {
  const changed = setVariantIntertext(variant, 'changed')

  expect(changed).toBeInstanceOf(LineVariant)
  expect(changed).toEqual(createVariant({ ...variant, intertext: 'changed' }))
  expect(changed.manuscripts).toBe(variant.manuscripts)
})

test('setVariantReconstruction', () => {
  expect(setVariantReconstruction(variant, 'kur-kur')).toEqual(
    createVariant({ ...variant, reconstruction: 'kur-kur' }),
  )
})

test('setVariantManuscriptLine replaces one manuscript line', () => {
  const changedManuscriptLine = setManuscriptAtf(otherManuscriptLine, 'ra-am')
  const changed = setVariantManuscriptLine(variant, 1, changedManuscriptLine)

  expect(changed.manuscripts).toEqual([manuscriptLine, changedManuscriptLine])
  expect(changed.manuscripts[0]).toBe(manuscriptLine)
})

test.each<[string, ManuscriptLine, Partial<ManuscriptLine>]>([
  ['setManuscriptId', setManuscriptId(manuscriptLine, 7), { manuscriptId: 7 }],
  [
    'setManuscriptLabels',
    setManuscriptLabels(manuscriptLine, ['r', 'ii']),
    { labels: ['r', 'ii'] },
  ],
  [
    'setManuscriptNumber',
    setManuscriptNumber(manuscriptLine, "3'"),
    { number: "3'" },
  ],
  ['setManuscriptAtf', setManuscriptAtf(manuscriptLine, 'bu'), { atf: 'bu' }],
])('%s changes the manuscript line', (_name, changed, expected) => {
  expect(changed).toBeInstanceOf(ManuscriptLine)
  expect(changed).toEqual(
    createManuscriptLine({ ...manuscriptLine, ...expected }),
  )
  expect(manuscriptLine.manuscriptId).toBe(1)
})

test.each<[string, string[]]>([
  ['', []],
  ['o', ['o']],
  ['o ', ['o']],
  ['  o   iii ', ['o', 'iii']],
])('parseLabels(%j)', (text, expected) => {
  expect(parseLabels(text)).toEqual(expected)
})

test('formatLabels joins the labels with spaces', () => {
  expect(formatLabels(['o', 'iii'])).toBe('o iii')
  expect(formatLabels([])).toBe('')
})
