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
  addLineVariant,
  addVariantManuscriptLine,
  removeLineVariant,
  removeVariantManuscriptLine,
} from 'corpus/ui/edit-lite/lineDraft'

const firstManuscriptLine: ManuscriptLine = createManuscriptLine({
  manuscriptId: 1,
  number: '1',
  atf: 'kur',
})
const secondManuscriptLine: ManuscriptLine = createManuscriptLine({
  manuscriptId: 2,
  number: '2',
  atf: 'ra',
})
const firstVariant: LineVariant = createVariant({
  reconstruction: 'kur',
  manuscripts: [firstManuscriptLine, secondManuscriptLine],
})
const secondVariant: LineVariant = createVariant({ reconstruction: 'ra' })
const line: Line = createLine({
  number: '1',
  variants: [firstVariant, secondVariant],
})

test('addLineVariant appends an empty variant and marks the line as edited', () => {
  const changedLine = addLineVariant(line)

  expect(changedLine.variants).toEqual([
    firstVariant,
    secondVariant,
    createVariant({}),
  ])
  expect(changedLine.variants[0]).toBe(firstVariant)
  expect(changedLine.status).toBe(EditStatus.EDITED)
  expect(line.variants).toHaveLength(2)
})

test('removeLineVariant removes the variant at the index only', () => {
  const changedLine = removeLineVariant(line, 0)

  expect(changedLine.variants).toEqual([secondVariant])
  expect(changedLine.variants[0]).toBe(secondVariant)
  expect(changedLine.status).toBe(EditStatus.EDITED)
  expect(removeLineVariant(line, 1).variants).toEqual([firstVariant])
})

test('changing the variants of a new line keeps it new', () => {
  const newLine: Line = { ...line, status: EditStatus.NEW }

  expect(addLineVariant(newLine).status).toBe(EditStatus.NEW)
  expect(removeLineVariant(newLine, 1).status).toBe(EditStatus.NEW)
})

test('addVariantManuscriptLine appends a manuscript line without a siglum', () => {
  const changedVariant = addVariantManuscriptLine(firstVariant)

  expect(changedVariant.manuscripts).toEqual([
    firstManuscriptLine,
    secondManuscriptLine,
    createManuscriptLine({}),
  ])
  expect(changedVariant.manuscripts[2].manuscriptId).toBe(0)
  expect(changedVariant.manuscripts[0]).toBe(firstManuscriptLine)
  expect(changedVariant.reconstruction).toBe('kur')
  expect(firstVariant.manuscripts).toHaveLength(2)
})

test('removeVariantManuscriptLine removes the manuscript line at the index only', () => {
  expect(removeVariantManuscriptLine(firstVariant, 0).manuscripts).toEqual([
    secondManuscriptLine,
  ])
  expect(removeVariantManuscriptLine(firstVariant, 1).manuscripts).toEqual([
    firstManuscriptLine,
  ])
  expect(addVariantManuscriptLine(secondVariant).manuscripts).toHaveLength(1)
})
