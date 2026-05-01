import React from 'react'
import DossierRecord from 'dossiers/domain/DossierRecord'
import _ from 'lodash'
import InlineMarkdown from 'common/ui/InlineMarkdown'
import { stringify } from 'query-string'
import { PeriodModifiers, periods } from 'common/utils/period'
import './DossiersDisplay.sass'

interface GroupedDossiers {
  [key: string]: DossierRecord[]
}

const collator = new Intl.Collator([], { numeric: true, sensitivity: 'base' })
const scriptPeriodOrder: ReadonlyMap<string, number> = new Map(
  periods.map((period, index) => [period.name, index]),
)
const unknownScriptPeriodOrder = periods.length

function getPeriodName(record: DossierRecord): string {
  return record.script?.period?.name || 'Unknown Period'
}

function getPeriodModifierName(record: DossierRecord): string | null {
  const periodModifier = record.script?.periodModifier
  if (!periodModifier || periodModifier.name === PeriodModifiers.None.name) {
    return null
  }
  return periodModifier.name
}

function getProvenanceName(record: DossierRecord): string {
  return record.provenance?.name || 'Unknown Provenance'
}

function getScriptDescription(record: DossierRecord): string {
  const period = getPeriodName(record)
  const modifier = getPeriodModifierName(record)
  return modifier ? `${period} (${modifier})` : period
}

function getScriptPeriodOrder(record: DossierRecord): number {
  const periodName = record.script?.period?.name
  return !periodName
    ? unknownScriptPeriodOrder
    : (scriptPeriodOrder.get(periodName) ?? unknownScriptPeriodOrder)
}

function compareDossierRecords(
  firstRecord: DossierRecord,
  secondRecord: DossierRecord,
): number {
  const periodComparison =
    getScriptPeriodOrder(firstRecord) - getScriptPeriodOrder(secondRecord)
  if (periodComparison !== 0) {
    return periodComparison
  }

  const provenanceComparison = collator.compare(
    getProvenanceName(firstRecord),
    getProvenanceName(secondRecord),
  )
  if (provenanceComparison !== 0) {
    return provenanceComparison
  }

  const scriptComparison = collator.compare(
    getScriptDescription(firstRecord),
    getScriptDescription(secondRecord),
  )
  if (scriptComparison !== 0) {
    return scriptComparison
  }

  return collator.compare(firstRecord.id, secondRecord.id)
}

function sortDossierRecords(
  records: readonly DossierRecord[],
): DossierRecord[] {
  return [...records].sort(compareDossierRecords)
}

function createDossierSearchPath(recordId: string): string {
  return `/library/search/?${stringify({ dossier: recordId })}`
}

function createGroupKey(record: DossierRecord): string {
  return `${getScriptDescription(record)} — ${getProvenanceName(record)}`
}

function createDisplayKey(
  record: DossierRecord,
  showProvenance: boolean,
): string {
  const scriptDescription = getScriptDescription(record)

  if (showProvenance) {
    return `${scriptDescription} — ${getProvenanceName(record)}`
  }
  return scriptDescription
}

function groupDossiersByScriptAndProvenance(
  records: readonly DossierRecord[],
): GroupedDossiers {
  return _.groupBy(sortDossierRecords(records), createGroupKey)
}

function DossierItem({ record }: { record: DossierRecord }): JSX.Element {
  return (
    <a
      className="dossier-records__item"
      href={createDossierSearchPath(record.id)}
    >
      {record.id}
    </a>
  )
}

function DossierGroup({
  groupKey,
  records,
  showProvenance,
}: {
  groupKey: string
  records: DossierRecord[]
  showProvenance: boolean
}): JSX.Element {
  const displayKey = createDisplayKey(records[0], showProvenance)
  return (
    <div className="dossier-group" key={groupKey}>
      <div className="dossier-group__header">
        <InlineMarkdown source={`**${displayKey}**`} />
      </div>
      <div className="dossier-group__items">
        <span className="dossier-prefix">Dossiers: </span>
        {records.map((record, index) => (
          <React.Fragment key={`${record.id}-${index}`}>
            {index > 0 && ', '}
            <DossierItem record={record} />
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}

export function DossiersGroupedDisplay({
  records,
  showProvenance = true,
}: {
  records: readonly DossierRecord[]
  showProvenance?: boolean
}): JSX.Element {
  if (records.length === 0) {
    return <></>
  }

  const groupedDossiers = groupDossiersByScriptAndProvenance(records)
  const groups = Object.entries(groupedDossiers)

  return (
    <div className="dossiers-grouped-display">
      {groups.map(([groupKey, groupRecords]) => (
        <DossierGroup
          key={groupKey}
          groupKey={groupKey}
          records={groupRecords}
          showProvenance={showProvenance}
        />
      ))}
    </div>
  )
}
