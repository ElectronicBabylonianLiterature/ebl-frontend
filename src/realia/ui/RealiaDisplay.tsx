import React, { useMemo } from 'react'
import { Redirect } from 'router/compat'
import withData, { WithoutData } from 'http/withData'
import RealiaService from 'realia/application/RealiaService'
import {
  RealiaEntry,
  getRealiaCrossReferences,
  getRedirectTarget,
  groupAfoRegisterByVolume,
  isRealiaId,
} from 'realia/domain/RealiaEntry'
import { getRealiaPageUrl } from 'realia/ui/realiaPage'
import RealiaDevelopmentNotice from 'realia/ui/RealiaDevelopmentNotice'
import EntryNavMenu from 'common/ui/entry-page/EntryNavMenu'
import { EntrySection } from 'common/ui/entry-page/EntrySection'
import useEntryPageNavigation from 'common/ui/entry-page/useEntryPageNavigation'
import { AfoRegisterVolumes } from 'realia/ui/RealiaAfoRegister'
import { ReallexikonEntries } from 'realia/ui/RealiaReallexikon'
import { RealiaMetadata, SeeAlsoList } from 'realia/ui/RealiaParts'
import { RealiaRedirect } from 'realia/ui/RealiaRedirect'
import { buildRealiaNav, realiaSectionIds } from 'realia/ui/realiaSections'
import ReferenceList from 'bibliography/ui/ReferenceList'
import SessionContext from 'auth/SessionContext'
import { Session } from 'auth/Session'
import AppContent from 'common/ui/AppContent'
import { SectionCrumb, TextCrumb } from 'common/ui/Breadcrumbs'
import 'realia/ui/Realia.sass'

function AuthorizedRealiaEntry({ entry }: { entry: RealiaEntry }): JSX.Element {
  const crossReferences = useMemo(
    () => getRealiaCrossReferences(entry),
    [entry],
  )
  const volumeGroups = useMemo(
    () => groupAfoRegisterByVolume(entry.afoRegister),
    [entry.afoRegister],
  )
  const navSections = useMemo(
    () => buildRealiaNav({ entry, volumeGroups, crossReferences }),
    [entry, volumeGroups, crossReferences],
  )
  const {
    openSections,
    toggleSection,
    activeId,
    selectedId,
    navigateToSection,
  } = useEntryPageNavigation(realiaSectionIds.top, navSections)
  const typeLabel = entry.type.length > 0 ? entry.type.join(', ') : null

  return (
    <div className="EntryPage__layout">
      <EntryNavMenu
        title={entry.id}
        subtitle={typeLabel}
        topId={realiaSectionIds.top}
        sections={navSections}
        openSections={openSections}
        activeId={activeId}
        selectedId={selectedId}
        onToggleSection={toggleSection}
        onNavigate={navigateToSection}
      />
      <div className="EntryPage__content">
        <div id={realiaSectionIds.top} className="EntryPage__top">
          <RealiaDevelopmentNotice />
          <h1>{entry.id}</h1>
          <RealiaMetadata entry={entry} />
        </div>
        {entry.reallexikon.length > 0 && (
          <EntrySection
            id={realiaSectionIds.reallexikon}
            heading="I. Reallexikon der Assyriologie und Vorderasiatischen Archäologie"
            open={openSections[realiaSectionIds.reallexikon]}
            onToggle={toggleSection}
          >
            <ReallexikonEntries entries={entry.reallexikon} />
          </EntrySection>
        )}
        {entry.afoRegister.length > 0 && (
          <EntrySection
            id={realiaSectionIds.afoRegister}
            heading="II. AfO-Register Realien"
            open={openSections[realiaSectionIds.afoRegister]}
            onToggle={toggleSection}
          >
            <AfoRegisterVolumes
              entryId={entry.id}
              volumeGroups={volumeGroups}
            />
          </EntrySection>
        )}
        {entry.references.length > 0 && (
          <EntrySection
            id={realiaSectionIds.references}
            heading="III. References"
            open={openSections[realiaSectionIds.references]}
            onToggle={toggleSection}
          >
            <ReferenceList references={entry.references} />
          </EntrySection>
        )}
        {crossReferences.length > 0 && (
          <EntrySection
            id={realiaSectionIds.seeAlso}
            heading="IV. See Also"
            open={openSections[realiaSectionIds.seeAlso]}
            onToggle={toggleSection}
          >
            <SeeAlsoList crossReferences={crossReferences} />
          </EntrySection>
        )}
      </div>
    </div>
  )
}

function RealiaEntryDisplay({
  data: entry,
  id,
}: {
  data: RealiaEntry
  id: string
}): JSX.Element {
  if (isRealiaId(id) && entry.id !== id) {
    return <Redirect to={getRealiaPageUrl(entry.id)} />
  }
  const redirectTarget = getRedirectTarget(entry)
  return (
    <AppContent
      crumbs={[
        new SectionCrumb('Tools'),
        new SectionCrumb('Realia'),
        new TextCrumb(entry.id),
      ]}
      hideHeading
    >
      <SessionContext.Consumer>
        {(session: Session): JSX.Element => {
          if (!session.isAllowedToReadRealia()) {
            return <p>Please log in to browse the Dictionary of Realia.</p>
          }
          return redirectTarget ? (
            <RealiaRedirect entry={entry} target={redirectTarget} />
          ) : (
            <AuthorizedRealiaEntry entry={entry} />
          )
        }}
      </SessionContext.Consumer>
    </AppContent>
  )
}

export default withData<
  WithoutData<{ data: RealiaEntry; id: string }>,
  { realiaService: RealiaService },
  RealiaEntry
>(
  RealiaEntryDisplay,
  (props, signal) => props.realiaService.find(props.id, signal),
  {
    watch: (props) => [props.id],
  },
)
