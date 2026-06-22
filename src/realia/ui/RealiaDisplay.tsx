import React from 'react'
import { Link } from 'react-router-dom'
import withData, { WithoutData } from 'http/withData'
import RealiaService from 'realia/application/RealiaService'
import {
  AfoRegisterEntry,
  AfoRegisterVolumeEntry,
  AfoRegisterVolumeGroup,
  ReallexikonEntry,
  RealiaCrossReference,
  RealiaEntry,
  getRealiaCrossReferences,
  groupAfoRegisterByVolume,
  formatAfoRegisterVolumeTitle,
} from 'realia/domain/RealiaEntry'
import ExternalLink from 'common/ui/ExternalLink'
import { CollapsibleCard } from 'common/ui/CollabsibleCard'
import ReferenceList from 'bibliography/ui/ReferenceList'
import SessionContext from 'auth/SessionContext'
import { Session } from 'auth/Session'
import AppContent from 'common/ui/AppContent'
import { SectionCrumb, TextCrumb } from 'common/ui/Breadcrumbs'
import 'realia/ui/Realia.sass'

function RealiaMetadata({ entry }: { entry: RealiaEntry }): JSX.Element {
  const typeLabels = entry.type.join(', ') || '—'
  return (
    <div className="Realia__metadata">
      {entry.wikidataId.map((wikidataId) => (
        <span key={wikidataId}>
          <ExternalLink href={`https://www.wikidata.org/wiki/${wikidataId}`}>
            Wikidata: {wikidataId}
          </ExternalLink>{' '}
        </span>
      ))}
      {entry.relatedTerms.length > 0 && (
        <span>
          <span className="Realia__metadata-label">Related terms: </span>
          {entry.relatedTerms.join(', ')}{' '}
        </span>
      )}
      <span>
        <span className="Realia__metadata-label">Type: </span>
        {typeLabels}
      </span>
    </div>
  )
}

function ReallexikonSection({
  entries,
}: {
  entries: readonly ReallexikonEntry[]
}): JSX.Element {
  return (
    <div className="Realia__section">
      <h2>I. Reallexikon der Assyriologie und Vorderasiatischen Archäologie</h2>
      {entries.map((entry) => (
        <CollapsibleCard
          key={entry.id}
          label={
            entry.content ? `${entry.title} (${entry.content})` : entry.title
          }
          collapsed={true}
        >
          {entry.references.length > 0 && (
            <ReferenceList references={entry.references} />
          )}
        </CollapsibleCard>
      ))}
    </div>
  )
}

function afoEntryHasVisibleContent(
  afoEntry: AfoRegisterVolumeEntry,
  showMainWord: boolean,
  showPage: boolean,
): boolean {
  return Boolean(
    (showMainWord && afoEntry.mainWord) ||
    (showPage && afoEntry.page) ||
    afoEntry.note ||
    afoEntry.reference,
  )
}

function AfoRegisterEntryItem({
  afoEntry,
  showMainWord,
  showPage,
}: {
  afoEntry: AfoRegisterVolumeEntry
  showMainWord: boolean
  showPage: boolean
}): JSX.Element {
  return (
    <li className="Realia__afo-entry">
      {showMainWord && afoEntry.mainWord && (
        <span className="Realia__afo-mainword">{afoEntry.mainWord}</span>
      )}
      {showPage && afoEntry.page && (
        <span className="Realia__afo-citation">{afoEntry.page}</span>
      )}
      {afoEntry.note && <p className="Realia__afo-note">{afoEntry.note}</p>}
      {afoEntry.reference && (
        <p className="Realia__afo-reference">{afoEntry.reference}</p>
      )}
    </li>
  )
}

function AfoRegisterVolumeCard({
  entryId,
  group,
}: {
  entryId: string
  group: AfoRegisterVolumeGroup
}): JSX.Element {
  const title = formatAfoRegisterVolumeTitle(entryId, group)
  return (
    <CollapsibleCard
      label={
        <>
          <strong className="Realia__afo-volume-mainword">
            {title.mainWord}
          </strong>
          {': '}
          <span className="Realia__afo-volume-details">{title.details}</span>
        </>
      }
      collapsed={true}
    >
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
    </CollapsibleCard>
  )
}

function AfoRegisterSection({
  entryId,
  entries,
}: {
  entryId: string
  entries: readonly AfoRegisterEntry[]
}): JSX.Element {
  const volumeGroups = groupAfoRegisterByVolume(entries)
  return (
    <div className="Realia__section">
      <h2>II. AfO-Register Realien</h2>
      {volumeGroups.map((group) => (
        <AfoRegisterVolumeCard
          key={group.volume}
          entryId={entryId}
          group={group}
        />
      ))}
    </div>
  )
}

function SeeAlsoSection({
  crossReferences,
}: {
  crossReferences: readonly RealiaCrossReference[]
}): JSX.Element {
  return (
    <div className="Realia__section">
      <h2>IV. See Also</h2>
      <ul className="Realia__see-also">
        {crossReferences.map((crossReference) => (
          <li key={crossReference.id}>
            <Link
              to={`/tools/realia/${encodeURIComponent(crossReference.lemma)}`}
            >
              {crossReference.lemma}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

function RealiaEntryDisplay({
  data: entry,
}: {
  data: RealiaEntry
}): JSX.Element {
  const crossReferences = getRealiaCrossReferences(entry)
  return (
    <AppContent
      crumbs={[new SectionCrumb('Realia'), new TextCrumb(entry.id)]}
      hideHeading
    >
      <SessionContext.Consumer>
        {(session: Session): JSX.Element =>
          session.isAllowedToReadRealia() ? (
            <>
              <h1>{entry.id}</h1>
              <RealiaMetadata entry={entry} />
              {entry.reallexikon.length > 0 && (
                <ReallexikonSection entries={entry.reallexikon} />
              )}
              {entry.afoRegister.length > 0 && (
                <AfoRegisterSection
                  entryId={entry.id}
                  entries={entry.afoRegister}
                />
              )}
              {entry.references.length > 0 && (
                <div className="Realia__section">
                  <h2>III. References</h2>
                  <ReferenceList references={entry.references} />
                </div>
              )}
              {crossReferences.length > 0 && (
                <SeeAlsoSection crossReferences={crossReferences} />
              )}
            </>
          ) : (
            <p>Please log in to browse the Dictionary of Realia.</p>
          )
        }
      </SessionContext.Consumer>
    </AppContent>
  )
}

export default withData<
  WithoutData<{ data: RealiaEntry }>,
  { realiaService: RealiaService; id: string },
  RealiaEntry
>(RealiaEntryDisplay, (props) => props.realiaService.find(props.id))
