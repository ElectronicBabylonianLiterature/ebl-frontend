import React from 'react'
import withData, { WithoutData } from 'http/withData'
import RealiaService from 'realia/application/RealiaService'
import {
  AfoRegisterEntry,
  ReallexikonEntry,
  RealiaEntry,
  getRealiaTypeLabels,
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
  const typeLabels = getRealiaTypeLabels(entry.type).join(', ') || '—'
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
  entry,
}: {
  entry: ReallexikonEntry
}): JSX.Element {
  return (
    <div className="Realia__section">
      <h2>I. Reallexikon der Assyriologie und Vorderasiatischen Archäologie</h2>
      <CollapsibleCard
        label={
          entry.content ? `${entry.title} (${entry.content})` : entry.title
        }
        collapsed={true}
      >
        {entry.reference && <ReferenceList references={[entry.reference]} />}
      </CollapsibleCard>
    </div>
  )
}

function AfoRegisterItem({
  afoEntry,
}: {
  afoEntry: AfoRegisterEntry
}): JSX.Element {
  return (
    <div>
      <strong>{afoEntry.mainWord}</strong>
      {afoEntry.note && <p>{afoEntry.note}</p>}
      <span className="Realia__afo-citation">
        [AfO {afoEntry.AfO} {afoEntry.reference}]
      </span>
      {afoEntry.crossReference && (
        <p className="Realia__afo-citation">
          See also: {afoEntry.crossReference}
        </p>
      )}
    </div>
  )
}

function AfoRegisterSection({
  entries,
}: {
  entries: readonly AfoRegisterEntry[]
}): JSX.Element {
  return (
    <div className="Realia__section">
      <h2>II. AfO-Register Realien</h2>
      {entries.map((afoEntry, index) => (
        <AfoRegisterItem key={index} afoEntry={afoEntry} />
      ))}
    </div>
  )
}

function RealiaEntryDisplay({
  data: entry,
}: {
  data: RealiaEntry
}): JSX.Element {
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
              {entry.reallexikon && (
                <ReallexikonSection entry={entry.reallexikon} />
              )}
              {entry.afoRegister.length > 0 && (
                <AfoRegisterSection entries={entry.afoRegister} />
              )}
              {entry.references.length > 0 && (
                <div className="Realia__section">
                  <h2>III. References</h2>
                  <ReferenceList references={entry.references} />
                </div>
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
