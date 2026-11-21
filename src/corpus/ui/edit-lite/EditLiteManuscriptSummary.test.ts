import { produce } from 'immer'
import { PeriodModifiers } from 'common/utils/period'
import { Periods } from 'common/utils/periodDefinitions'
import { Manuscript, ManuscriptTypes } from 'corpus/domain/manuscript'
import {
  emptyManuscriptCell,
  isManuscriptEdited,
  summarizeManuscript,
} from 'corpus/ui/edit-lite/EditLiteManuscriptSummary'

const provenance = { name: 'Nineveh', abbreviation: 'Nin', parent: 'Assyria' }

describe('summarizeManuscript', () => {
  test('describes a manuscript with a museum number', () => {
    expect(
      summarizeManuscript(
        new Manuscript({
          siglumDisambiguator: '1a',
          museumNumber: 'K.5419.C',
          accession: 'A.1',
          period: Periods['Neo-Assyrian'],
          provenance,
          type: ManuscriptTypes.Library,
        }),
      ),
    ).toEqual({
      siglum: 'NinNA1a',
      museumNumber: 'K.5419.C',
      period: 'Neo-Assyrian',
      provenance: 'Nineveh',
      type: 'Library',
    })
  })

  test('falls back to the accession and names the period modifier', () => {
    expect(
      summarizeManuscript(
        new Manuscript({
          siglumDisambiguator: '2',
          accession: 'A.33',
          periodModifier: PeriodModifiers.Late,
          period: Periods['Uruk III-Jemdet Nasr'],
          provenance,
          type: ManuscriptTypes.School,
        }),
      ),
    ).toEqual({
      siglum: 'NinJNSch2',
      museumNumber: 'A.33',
      period: 'Late Uruk III/Jemdet Nasr',
      provenance: 'Nineveh',
      type: 'School',
    })
  })

  test('marks the cells that have no value', () => {
    expect(
      summarizeManuscript(
        new Manuscript({
          period: Periods.None,
          provenance: { name: 'Standard Text', abbreviation: '', parent: null },
          type: ManuscriptTypes.None,
        }),
      ),
    ).toEqual({
      siglum: emptyManuscriptCell,
      museumNumber: emptyManuscriptCell,
      period: '-',
      provenance: 'Standard Text',
      type: '-',
    })
  })
})

describe('isManuscriptEdited', () => {
  const original = new Manuscript({ notes: 'a note', provenance })

  test('is false for the same manuscript', () => {
    expect(isManuscriptEdited(original, original)).toBe(false)
  })

  test('is true for a changed manuscript', () => {
    expect(
      isManuscriptEdited(
        original,
        produce(original, (draft) => {
          draft.notes = 'another note'
        }),
      ),
    ).toBe(true)
  })

  test('is false when a change was undone', () => {
    const changed = produce(original, (draft) => {
      draft.notes = 'another note'
    })

    expect(
      isManuscriptEdited(
        original,
        produce(changed, (draft) => {
          draft.notes = 'a note'
        }),
      ),
    ).toBe(false)
  })
})
