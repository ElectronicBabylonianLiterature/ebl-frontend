import {
  filterProvenances,
  getEmptyStateMessage,
} from 'map/domain/findspotFilter'
import { makeProvenance } from 'map/testFixtures/provenance'

const assur = makeProvenance({ id: 'assur', longName: 'Aššur' })
const babylon = makeProvenance({ id: 'babylon', longName: 'Babylon' })
const girsu = makeProvenance({ id: 'girsu', longName: 'Ĝirsu' })
const hursagkalama = makeProvenance({
  id: 'hursagkalama',
  longName: 'Ḫursagkalama',
})
const durKurigalzu = makeProvenance({
  id: 'dur-kurigalzu',
  longName: 'Dūr-Kurigalzu',
})

describe('filterProvenances', () => {
  it('matches a diacritic site name from the plain-ASCII form', () => {
    expect(filterProvenances([assur, babylon], 'assur')).toEqual([assur])
  })

  it('folds non-decomposing Assyriological letters', () => {
    expect(filterProvenances([girsu], 'girsu')).toEqual([girsu])
  })

  it('matches on a folded substring', () => {
    expect(filterProvenances([hursagkalama], 'hursag')).toEqual([hursagkalama])
  })

  it('matches hyphenated diacritic names', () => {
    expect(filterProvenances([durKurigalzu], 'dur-kurigalzu')).toEqual([
      durKurigalzu,
    ])
  })

  it('stays case-insensitive', () => {
    expect(filterProvenances([assur, babylon], 'BAB')).toEqual([babylon])
  })

  it('returns the input array by reference for a whitespace-only filter', () => {
    const list = [assur, babylon]
    expect(filterProvenances(list, '   ')).toBe(list)
  })

  it('returns null when there are no provenances', () => {
    expect(filterProvenances(null, 'x')).toBeNull()
  })
})

describe('getEmptyStateMessage', () => {
  it('echoes the raw typed filter', () => {
    expect(getEmptyStateMessage('assur')).toBe('No findspots match “assur”.')
  })

  it('reports missing data when the filter is blank', () => {
    expect(getEmptyStateMessage('  ')).toBe(
      'No findspot locations are available.',
    )
  })
})
