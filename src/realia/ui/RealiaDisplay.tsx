import React from 'react'
import withData, { WithoutData } from 'http/withData'
import RealiaService from 'realia/application/RealiaService'
import { RealiaEntry, REALIA_TYPE_LABELS } from 'realia/domain/RealiaEntry'
import ExternalLink from 'common/ui/ExternalLink'
import { CollapsibleCard } from 'common/ui/CollabsibleCard'
import ReferenceList from 'bibliography/ui/ReferenceList'
import SessionContext from 'auth/SessionContext'
import { Session } from 'auth/Session'
import 'realia/ui/Realia.sass'

function RealiaEntryDisplay({
  data: entry,
}: {
  data: RealiaEntry
}): JSX.Element {
  const typeLabels =
    entry.type.map((t) => REALIA_TYPE_LABELS[t]).join(', ') || '—'

  return (
    <SessionContext.Consumer>
      {(session: Session): JSX.Element =>
        session.isAllowedToReadRealia() ? (
          <>
            <h1>{entry.id}</h1>
            <div className="Realia__metadata">
              {entry.wikidataId.map((wikidataId) => (
                <span key={wikidataId}>
                  <ExternalLink
                    href={`https://www.wikidata.org/wiki/${wikidataId}`}
                  >
                    Wikidata: {wikidataId}
                  </ExternalLink>{' '}
                </span>
              ))}
              {entry.relatedTerms.length > 0 && (
                <span>{entry.relatedTerms.join(', ')} </span>
              )}
              <span>{typeLabels}</span>
            </div>
            {entry.reallexikon.length > 0 && (
              <div className="Realia__section">
                <h2>
                  I. Reallexikon der Assyriologie und Vorderasiatischen
                  Archäologie
                </h2>
                {entry.reallexikon.map((reallexikonEntry) => (
                  <CollapsibleCard
                    key={reallexikonEntry.id}
                    label={`${reallexikonEntry.title} (${reallexikonEntry.content})`}
                    collapsed={true}
                  >
                    {reallexikonEntry.reference && (
                      <ReferenceList
                        references={[reallexikonEntry.reference]}
                      />
                    )}
                  </CollapsibleCard>
                ))}
              </div>
            )}
            {entry.afoRegister.length > 0 && (
              <div className="Realia__section">
                <h2>II. AfO-Register Realien</h2>
                {entry.afoRegister.map((afoEntry, index) => (
                  <div key={index}>
                    <strong>{afoEntry.mainWord}</strong>
                    {afoEntry.note && <p>{afoEntry.note}</p>}
                    <span className="Realia__afo-citation">
                      [AfO {afoEntry.AfO} {afoEntry.reference}]
                    </span>
                  </div>
                ))}
              </div>
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
  )
}

export default withData<
  WithoutData<{ data: RealiaEntry }>,
  { realiaService: RealiaService; id: string },
  RealiaEntry
>(RealiaEntryDisplay, (props) => props.realiaService.find(props.id))
