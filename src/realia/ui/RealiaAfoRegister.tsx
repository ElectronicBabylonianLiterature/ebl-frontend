import React from 'react'
import { Link } from 'react-router-dom'
import {
  AfoRegisterEntry,
  AfoRegisterVolumeGroup,
  afoCrossReferenceCitation,
  formatAfoRegisterVolumeTitle,
  realiaCrossReferenceTarget,
} from 'realia/domain/RealiaEntry'
import { afoVolumeId } from 'realia/ui/realiaSections'

function afoEntryHasVisibleContent(
  afoEntry: AfoRegisterEntry,
  showMainWord: boolean,
  showPage: boolean,
): boolean {
  return [
    showMainWord && afoEntry.mainWord,
    showPage && afoEntry.AfO,
    afoEntry.note,
    afoEntry.reference,
    afoEntry.crossReferences.length > 0,
    afoEntry.crossReference,
  ].some(Boolean)
}

function AfoEntryCrossReference({
  afoEntry,
}: {
  afoEntry: AfoRegisterEntry
}): JSX.Element {
  const citation = afoCrossReferenceCitation(afoEntry)
  const volumeAnchor = afoEntry.afoVolume
    ? `#${afoVolumeId(afoEntry.afoVolume)}`
    : ''
  return (
    <p className="Realia__afo-cross-reference">
      <i className="fas fa-arrow-right" aria-hidden="true" />
      {afoEntry.crossReferences.map((crossReference, index) => (
        <React.Fragment key={`${crossReference.id}-${index}`}>
          {index > 0 && ', '}
          <Link
            to={`/tools/realia/${encodeURIComponent(
              realiaCrossReferenceTarget(crossReference),
            )}${volumeAnchor}`}
          >
            {crossReference.lemma}
          </Link>
        </React.Fragment>
      ))}
      {citation && (
        <span className="Realia__afo-cross-reference-volume">{citation}</span>
      )}
    </p>
  )
}

function AfoRegisterEntryItem({
  afoEntry,
  showMainWord,
  showPage,
}: {
  afoEntry: AfoRegisterEntry
  showMainWord: boolean
  showPage: boolean
}): JSX.Element {
  const hasResolvedCrossReferences = afoEntry.crossReferences.length > 0
  return (
    <li className="Realia__afo-entry">
      {showMainWord && afoEntry.mainWord && (
        <span className="Realia__afo-mainword">{afoEntry.mainWord}</span>
      )}
      {showPage && afoEntry.AfO && (
        <span className="Realia__afo-citation">{afoEntry.AfO}</span>
      )}
      {afoEntry.note && <p className="Realia__afo-note">{afoEntry.note}</p>}
      {afoEntry.reference && (
        <p className="Realia__afo-reference">{afoEntry.reference}</p>
      )}
      {hasResolvedCrossReferences ? (
        <AfoEntryCrossReference afoEntry={afoEntry} />
      ) : (
        afoEntry.crossReference && (
          <p className="Realia__afo-cross-reference">
            <i className="fas fa-arrow-right" aria-hidden="true" />
            <span className="Realia__afo-cross-reference-text">
              {afoEntry.crossReference}
            </span>
          </p>
        )
      )}
    </li>
  )
}

function AfoRegisterVolume({
  id,
  entryId,
  group,
}: {
  id: string
  entryId: string
  group: AfoRegisterVolumeGroup
}): JSX.Element {
  const title = formatAfoRegisterVolumeTitle(entryId, group)
  return (
    <div id={id} className="Realia__afo-volume">
      <h3 className="Realia__afo-volume-title">
        <strong className="Realia__afo-volume-mainword">
          {title.mainWord}
        </strong>
        {': '}
        <span className="Realia__afo-volume-details">{title.details}</span>
      </h3>
      <ul className="Realia__afo-entries" aria-label={group.volume}>
        {group.entries
          .filter((afoEntry) =>
            afoEntryHasVisibleContent(
              afoEntry,
              group.hasDistinctMainWords,
              group.hasDistinctPages,
            ),
          )
          .map((afoEntry, index) => (
            <AfoRegisterEntryItem
              key={index}
              afoEntry={afoEntry}
              showMainWord={group.hasDistinctMainWords}
              showPage={group.hasDistinctPages}
            />
          ))}
      </ul>
    </div>
  )
}

export function AfoRegisterVolumes({
  entryId,
  volumeGroups,
}: {
  entryId: string
  volumeGroups: readonly AfoRegisterVolumeGroup[]
}): JSX.Element {
  return (
    <>
      {volumeGroups.map((group) => (
        <AfoRegisterVolume
          key={group.volume}
          id={afoVolumeId(group.volume)}
          entryId={entryId}
          group={group}
        />
      ))}
    </>
  )
}
