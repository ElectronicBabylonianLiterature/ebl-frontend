import type {
  ChoroplethLegend,
  MapVisualizationMode,
} from 'map/mapChoroplethScale'
import {
  COLOR_DENSITY_UNCLASSIFIED,
  COLOR_MAPPED_FRAGMENTS,
  COLOR_MAPPED_ZERO,
  COLOR_SELECTED,
  COLOR_UNAVAILABLE,
  COLOR_UNMAPPED,
} from 'map/mapPaintColors'
import {
  COLOR_EVIDENCE_CURATED,
  COLOR_EVIDENCE_MIXED,
  COLOR_EVIDENCE_VERIFIED,
} from 'map/mapEvidencePaint'
import { mappingEvidenceLabel } from 'map/mapResearchLabels'

export type LegendPattern = 'solid' | 'dashed' | 'dotted' | 'dash-dot' | 'halo'

export interface MapLegendEntry {
  readonly key: string
  readonly label: string
  readonly color: string
  readonly pattern: LegendPattern
  readonly outlineWidth?: number
}

const UNAVAILABLE_ENTRY: MapLegendEntry = {
  key: 'unavailable',
  label: 'Linked fragment data unavailable or loading',
  color: COLOR_UNAVAILABLE,
  pattern: 'dotted',
}
const UNMAPPED_ENTRY: MapLegendEntry = {
  key: 'unmapped',
  label: 'No mapped findspot',
  color: COLOR_UNMAPPED,
  pattern: 'dashed',
}
const SELECTED_ENTRY: MapLegendEntry = {
  key: 'selected',
  label: 'Selected area',
  color: COLOR_SELECTED,
  pattern: 'halo',
}
const DENSITY_UNCLASSIFIED_ENTRY: MapLegendEntry = {
  key: 'density-unclassified',
  label: 'Density unavailable (no usable mapped area)',
  color: COLOR_DENSITY_UNCLASSIFIED,
  pattern: 'dotted',
}

const EVIDENCE_ENTRIES: readonly MapLegendEntry[] = [
  {
    key: 'verified-source',
    label: mappingEvidenceLabel('verified-source'),
    color: COLOR_EVIDENCE_VERIFIED,
    pattern: 'solid',
  },
  {
    key: 'curated',
    label: mappingEvidenceLabel('curated'),
    color: COLOR_EVIDENCE_CURATED,
    pattern: 'dashed',
  },
  {
    key: 'mixed',
    label: mappingEvidenceLabel('mixed'),
    color: COLOR_EVIDENCE_MIXED,
    pattern: 'dash-dot',
  },
]

const MAPPED_ENTRIES: readonly MapLegendEntry[] = [
  {
    key: 'mapped-zero',
    label: 'Mapped, zero accessible fragments',
    color: COLOR_MAPPED_ZERO,
    pattern: 'solid',
  },
  {
    key: 'mapped-fragments',
    label: 'Mapped with accessible fragments',
    color: COLOR_MAPPED_FRAGMENTS,
    pattern: 'solid',
  },
]

function formatBound(value: number): string {
  return String(value)
}

export function classLabel(from: number, to: number | null): string {
  return to === null
    ? `≥ ${formatBound(from)}`
    : `≥ ${formatBound(from)} and < ${formatBound(to)}`
}

function classEntries(legend: ChoroplethLegend): readonly MapLegendEntry[] {
  return legend.classes.map((entry, index) => ({
    key: `class-${index}`,
    label: classLabel(entry.from, entry.to),
    color: entry.color,
    pattern: 'solid' as const,
    outlineWidth: Number((1.2 + 0.7 * index).toFixed(1)),
  }))
}

export function mapLegendEntries(
  mode: MapVisualizationMode,
  legend: ChoroplethLegend,
): readonly MapLegendEntry[] {
  if (mode === 'evidence') {
    return [
      UNAVAILABLE_ENTRY,
      UNMAPPED_ENTRY,
      ...EVIDENCE_ENTRIES,
      SELECTED_ENTRY,
    ]
  }
  if (mode === 'mapped') {
    return [
      UNAVAILABLE_ENTRY,
      UNMAPPED_ENTRY,
      ...MAPPED_ENTRIES,
      SELECTED_ENTRY,
    ]
  }

  return [
    UNAVAILABLE_ENTRY,
    UNMAPPED_ENTRY,
    ...(mode === 'density' ? [DENSITY_UNCLASSIFIED_ENTRY] : []),
    {
      key: 'zero',
      label:
        mode === 'density'
          ? 'Zero accessible fragments per km²'
          : 'Zero accessible fragments',
      color: COLOR_MAPPED_ZERO,
      pattern: 'solid' as const,
    },
    ...classEntries(legend),
    SELECTED_ENTRY,
  ]
}

export const DENSITY_UNAVAILABLE_NOTE =
  'Polygons without a usable area are left unclassified rather than counted as zero density.'
