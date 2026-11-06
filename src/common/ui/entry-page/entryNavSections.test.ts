import {
  EntryNavSection,
  getEntryAnchorIds,
  getEntrySectionByAnchor,
} from 'common/ui/entry-page/entryNavSections'

const sections: readonly EntryNavSection[] = [
  {
    id: 'forms',
    label: 'Forms',
    subsections: [
      { id: 'forms-key', label: 'Citation forms' },
      { id: 'forms-epsd2', label: 'Attested spellings' },
    ],
  },
  { id: 'signs', label: 'Signs', subsections: [] },
]

it('lists the top, each subsection, and each section without subsections', () => {
  expect(getEntryAnchorIds('top', sections)).toEqual([
    'top',
    'forms-key',
    'forms-epsd2',
    'signs',
  ])
})

it('maps every section and subsection to its section', () => {
  expect(getEntrySectionByAnchor(sections)).toEqual({
    forms: 'forms',
    'forms-key': 'forms',
    'forms-epsd2': 'forms',
    signs: 'signs',
  })
})
