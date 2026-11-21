import { produce } from 'immer'
import { Manuscript } from 'corpus/domain/manuscript'
import {
  addManuscript,
  countDeletedManuscripts,
  findManuscriptStatuses,
  removeAt,
  shiftOpenIndices,
  summarizeManuscriptEdits,
} from 'corpus/ui/edit-lite/manuscriptEdits'

const originals: readonly Manuscript[] = [
  new Manuscript({ id: 1, siglumDisambiguator: '1a' }),
  new Manuscript({ id: 4, siglumDisambiguator: '2' }),
]
const editedFirst: Manuscript = produce(originals[0], (draft) => {
  draft.notes = 'a note'
})

test('addManuscript appends an empty manuscript with the next free id', () => {
  const manuscripts = addManuscript(originals)

  expect(manuscripts).toHaveLength(3)
  expect(manuscripts[0]).toBe(originals[0])
  expect(manuscripts[2]).toEqual(new Manuscript({ id: 5 }))
  expect(addManuscript([])).toEqual([new Manuscript({ id: 1 })])
  expect(originals).toHaveLength(2)
})

test('removeAt removes the item at the index only', () => {
  expect(removeAt(['a', 'b', 'c'], 1)).toEqual(['a', 'c'])
  expect(removeAt(originals, 0)).toEqual([originals[1]])
  expect(removeAt(originals, 5)).toEqual(originals)
})

test('shiftOpenIndices closes the deleted row and follows the rows after it', () => {
  expect(shiftOpenIndices([0, 2, 3, 5], 2)).toEqual([0, 2, 4])
  expect(shiftOpenIndices([1], 4)).toEqual([1])
  expect(shiftOpenIndices([], 0)).toEqual([])
})

test('findManuscriptStatuses compares every manuscript with its original', () => {
  expect(findManuscriptStatuses(originals, originals)).toEqual([
    'unchanged',
    'unchanged',
  ])
  expect(
    findManuscriptStatuses(originals, [
      originals[1],
      editedFirst,
      new Manuscript({ id: 5 }),
    ]),
  ).toEqual(['unchanged', 'edited', 'new'])
})

test('countDeletedManuscripts counts the originals that are gone', () => {
  expect(countDeletedManuscripts(originals, originals)).toBe(0)
  expect(countDeletedManuscripts(originals, [editedFirst])).toBe(1)
  expect(countDeletedManuscripts(originals, [new Manuscript({ id: 5 })])).toBe(
    2,
  )
})

test.each<[readonly ('unchanged' | 'edited' | 'new')[], number, string]>([
  [[], 0, '0 manuscripts'],
  [['unchanged'], 0, '1 manuscript'],
  [['unchanged', 'edited'], 0, '2 manuscripts, 1 edited'],
  [['edited', 'new', 'new'], 0, '3 manuscripts, 1 edited, 2 new'],
  [['unchanged'], 2, '1 manuscript, 2 deleted'],
  [['edited', 'new'], 1, '2 manuscripts, 1 edited, 1 new, 1 deleted'],
])('summarizes %j with %i deleted as "%s"', (statuses, deleted, summary) => {
  expect(summarizeManuscriptEdits(statuses, deleted)).toBe(summary)
})
