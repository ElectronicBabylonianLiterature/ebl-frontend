import React, { useState, useRef } from 'react'
import DossierRecord from 'dossiers/domain/DossierRecord'
import _ from 'lodash'
import { Overlay, Popover } from 'react-bootstrap'
import { DossierRecordDisplay } from './DossiersDisplay'
import './DossiersDisplay.sass'

interface GroupedDossiers {
  [key: string]: DossierRecord[]
}

/**
 * Creates a group key from script period and provenance for dossier grouping
 * @param record - The dossier record to extract grouping key from
 * @returns A string key combining period, modifier, and provenance
 */
function createGroupKey(record: DossierRecord): string {
  const period = record.script?.period?.name || 'Unknown Period'
  const modifier = record.script?.periodModifier?.name || ''
  const provenance = record.provenance?.name || 'Unknown Provenance'

  const scriptDescription = modifier ? `${period} (${modifier})` : period

  return `${scriptDescription} — ${provenance}`
}

/**
 * Groups dossier records by script (period + modifier) and provenance
 * @param records - Array of dossier records to group
 * @returns Object with grouped dossiers keyed by "Period (Modifier) — Provenance"
 */
function groupDossiersByScriptAndProvenance(
  records: readonly DossierRecord[]
): GroupedDossiers {
  return _.groupBy(records, createGroupKey)
}

/**
 * Individual clickable dossier item with popover
 */
function DossierItem({
  record,
  index,
  groupIndex,
  activeDossier,
  setActiveDossier,
}: {
  record: DossierRecord
  index: number
  groupIndex: number
  activeDossier: string | null
  setActiveDossier: React.Dispatch<React.SetStateAction<string | null>>
}): JSX.Element {
  const target = useRef(null)
  const dossierKey = `${groupIndex}-${index}`
  const isActive = activeDossier === dossierKey

  return (
    <>
      <span
        ref={target}
        className={`dossier-records__item${isActive ? '__active' : ''}`}
        onClick={() => setActiveDossier(isActive ? null : dossierKey)}
      >
        {record.id}
      </span>

      <Overlay
        target={target.current}
        placement="right"
        show={isActive}
        onHide={() => setActiveDossier(null)}
        rootClose={true}
        rootCloseEvent="click"
      >
        <Popover
          id={`DossierPopover-${dossierKey}`}
          className="reference-popover__popover"
        >
          <Popover.Title as="h3">{record.id}</Popover.Title>
          <Popover.Content>
            <DossierRecordDisplay record={record} index={index} />
          </Popover.Content>
        </Popover>
      </Overlay>
    </>
  )
}

/**
 * Displays a single group of dossiers with a shared script/provenance heading
 */
function DossierGroup({
  groupKey,
  records,
  groupIndex,
  activeDossier,
  setActiveDossier,
}: {
  groupKey: string
  records: DossierRecord[]
  groupIndex: number
  activeDossier: string | null
  setActiveDossier: React.Dispatch<React.SetStateAction<string | null>>
}): JSX.Element {
  return (
    <div className="dossier-group" key={groupKey}>
      <div className="dossier-group__items">
        <span className="dossier-prefix">Dossiers: </span>
        {records.map((record, index) => (
          <React.Fragment key={`${groupIndex}-${index}`}>
            {index > 0 && ', '}
            <DossierItem
              record={record}
              index={index}
              groupIndex={groupIndex}
              activeDossier={activeDossier}
              setActiveDossier={setActiveDossier}
            />
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}

/**
 * Main component for displaying grouped dossiers in search results
 * Groups by script (period + periodModifier) and provenance for better organization
 */
export function DossiersGroupedDisplay({
  records,
}: {
  records: readonly DossierRecord[]
}): JSX.Element {
  const [activeDossier, setActiveDossier] = useState<string | null>(null)

  if (records.length === 0) {
    return <></>
  }

  const groupedDossiers = groupDossiersByScriptAndProvenance(records)
  const groups = Object.entries(groupedDossiers)

  return (
    <div className="dossiers-grouped-display">
      {groups.map(([groupKey, groupRecords], groupIndex) => (
        <DossierGroup
          key={groupKey}
          groupKey={groupKey}
          records={groupRecords}
          groupIndex={groupIndex}
          activeDossier={activeDossier}
          setActiveDossier={setActiveDossier}
        />
      ))}
    </div>
  )
}
