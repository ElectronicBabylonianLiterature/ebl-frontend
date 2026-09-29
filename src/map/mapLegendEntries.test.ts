import {
  buildChoroplethLegend,
  buildChoroplethScale,
} from 'map/mapChoroplethScale'
import { classLabel, mapLegendEntries } from 'map/mapLegendEntries'

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
    expect(classLabel(1, 5)).toBe('≥ 1 and < 5')
    expect(classLabel(20, null)).toBe('≥ 20')
  })

  it('keeps a fractional bound readable', () => {
    expect(classLabel(0.1234, 0.5678)).toBe('≥ 0.1234 and < 0.5678')
  })
})

describe('mapLegendEntries', () => {
  it('describes the evidence states', () => {
    expect(labelsFor('evidence')).toEqual([
      'Linked fragment data unavailable or loading',
      'No mapped findspot',
      'Verified-source mapping',
      'Curated mapping',
      'Mixed mapping evidence',
      'Selected area',
    ])
  })

  it('describes the mapped-status states', () => {
    expect(labelsFor('mapped')).toEqual([
      'Linked fragment data unavailable or loading',
      'No mapped findspot',
      'Mapped, zero accessible fragments',
      'Mapped with accessible fragments',
      'Selected area',
    ])
  })

  it('lists class ranges around the zero and unmapped states', () => {
    const labels = labelsFor('count', [1, 4, 9, 30])

    expect(labels[0]).toBe('Linked fragment data unavailable or loading')
    expect(labels[1]).toBe('No mapped findspot')
    expect(labels[2]).toBe('Zero accessible fragments')
    expect(labels[labels.length - 1]).toBe('Selected area')
    expect(labels.length).toBeGreaterThan(4)

    const entries = mapLegendEntries(
      'count',
      buildChoroplethLegend(
        'count',
        buildChoroplethScale('count', [1, 4, 9, 30]),
        [1, 4, 9, 30],
      ),
    ).filter((entry) => entry.key.startsWith('class-'))
    expect(entries.map((entry) => entry.outlineWidth)).toEqual([
      1.2, 1.9, 2.6, 3.3,
    ])
  })

  it('still describes the categorical states when nothing can be classified', () => {
    expect(labelsFor('density')).toEqual([
      'Linked fragment data unavailable or loading',
      'No mapped findspot',
      'Density unavailable (no usable mapped area)',
      'Zero accessible fragments per km²',
      'Selected area',
    ])
  })

  it('encodes the outline pattern as well as the colour', () => {
    const entries = mapLegendEntries(
      'evidence',
      buildChoroplethLegend('evidence', null, []),
    )

    expect(entries.map((entry) => entry.pattern)).toEqual([
      'dotted',
      'dashed',
      'solid',
      'dashed',
      'dash-dot',
      'halo',
    ])
    expect(new Set(entries.map((entry) => entry.color)).size).toBe(
      entries.length,
    )
  })
})
