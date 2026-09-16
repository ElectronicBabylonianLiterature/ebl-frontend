import {
  buildChoroplethLegend,
  buildChoroplethScale,
} from './mapChoroplethScale'
import { classLabel, mapLegendEntries } from './mapLegendEntries'

function labelsFor(
  mode: Parameters<typeof mapLegendEntries>[0],
  values: readonly number[] = [],
): readonly string[] {
  const scale = buildChoroplethScale(mode, values)
  return mapLegendEntries(mode, buildChoroplethLegend(mode, scale, values)).map(
    (entry) => entry.label,
  )
}

describe('classLabel', () => {
  it('names a bounded class and an open-ended one', () => {
    expect(classLabel(1, 5)).toBe('1 – 5')
    expect(classLabel(20, null)).toBe('20 and above')
  })

  it('keeps a fractional bound readable', () => {
    expect(classLabel(0.1234, 0.5678)).toBe('0.12 – 0.57')
  })
})

describe('mapLegendEntries', () => {
  it('describes the evidence states', () => {
    expect(labelsFor('evidence')).toEqual([
      'No mapped findspot',
      'Verified-source mapping',
      'Curated mapping',
      'Mixed mapping evidence',
      'Selected area',
    ])
  })

  it('describes the mapped-status states', () => {
    expect(labelsFor('mapped')).toEqual([
      'No mapped findspot',
      'Mapped, zero accessible fragments',
      'Mapped with accessible fragments',
      'Selected area',
    ])
  })

  it('lists class ranges around the zero and unmapped states', () => {
    const labels = labelsFor('count', [1, 4, 9, 30])

    expect(labels[0]).toBe('No mapped findspot')
    expect(labels[1]).toBe('Zero accessible fragments')
    expect(labels[labels.length - 1]).toBe('Selected area')
    expect(labels.length).toBeGreaterThan(4)
  })

  it('still describes the categorical states when nothing can be classified', () => {
    expect(labelsFor('density')).toEqual([
      'No mapped findspot',
      'Zero accessible fragments',
      'Selected area',
    ])
  })

  it('encodes the outline pattern as well as the colour', () => {
    const entries = mapLegendEntries(
      'evidence',
      buildChoroplethLegend('evidence', null, []),
    )

    expect(entries.map((entry) => entry.pattern)).toEqual([
      'dashed',
      'solid',
      'solid',
      'dash-dot',
      'halo',
    ])
    expect(new Set(entries.map((entry) => entry.color)).size).toBe(
      entries.length,
    )
  })
})
