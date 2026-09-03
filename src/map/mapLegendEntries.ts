import type {
  ChoroplethLegend,
  MapVisualizationMode,
} from './mapChoroplethScale'
import {
  COLOR_MAPPED_FRAGMENTS,
  COLOR_MAPPED_ZERO,
  COLOR_SELECTED,
  COLOR_UNMAPPED,
} from './mapPaintColors'
import {
  COLOR_EVIDENCE_CURATED,
  COLOR_EVIDENCE_MIXED,
  COLOR_EVIDENCE_VERIFIED,
} from './mapEvidencePaint'
import { mappingEvidenceLabel } from './mapResearchLabels'

export type LegendPattern = 'solid' | 'dashed' | 'dash-dot' | 'halo'

export interface MapLegendEntry {
  readonly key: string
  readonly label: string
  readonly color: string
  readonly pattern: LegendPattern
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
    pattern: 'solid',
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
  return value >= 100 || Number.isInteger(value)
    ? String(Math.round(value))
    : value.toPrecision(2)
}

export function classLabel(from: number, to: number | null): string {
  return to === null
    ? `${formatBound(from)} and above`
    : `${formatBound(from)} – ${formatBound(to)}`
}

function classEntries(legend: ChoroplethLegend): readonly MapLegendEntry[] {
  return legend.classes.map((entry, index) => ({
    key: `class-${index}`,
    label: classLabel(entry.from, entry.to),
    color: entry.color,
    pattern: 'solid' as const,
  }))
}
export function mapLegendEntries(
  mode: MapVisualizationMode,
  legend: ChoroplethLegend,
): readonly MapLegendEntry[] {
  if (mode === 'evidence') {
    return [UNMAPPED_ENTRY, ...EVIDENCE_ENTRIES, SELECTED_ENTRY]
  }

  if (mode === 'mapped') {
    return [UNMAPPED_ENTRY, ...MAPPED_ENTRIES, SELECTED_ENTRY]
  }

  return [
    UNMAPPED_ENTRY,
    {
      key: 'zero',
      label: 'Zero accessible fragments',
      color: COLOR_MAPPED_ZERO,
      pattern: 'solid',
    },
    ...classEntries(legend),
    SELECTED_ENTRY,
  ]
}

export const DENSITY_UNAVAILABLE_NOTE =
  'Polygons without a usable area are left unclassified rather than counted as zero density.'
