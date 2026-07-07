import React, { useCallback, useEffect, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { useHistory } from 'router/compat'
import withData, { WithoutData } from 'http/withData'
import RealiaService from 'realia/application/RealiaService'
import {
  RealiaEntry,
  getRealiaCrossReferences,
  getRedirectTarget,
  groupAfoRegisterByVolume,
} from 'realia/domain/RealiaEntry'
import RealiaDevelopmentNotice from 'realia/ui/RealiaDevelopmentNotice'
import RealiaNavMenu from 'realia/ui/RealiaNavMenu'
import { AfoRegisterVolumes } from 'realia/ui/RealiaAfoRegister'
import { ReallexikonEntries } from 'realia/ui/RealiaReallexikon'
import {
  RealiaMetadata,
  RealiaSection,
  SeeAlsoList,
} from 'realia/ui/RealiaParts'
import { RealiaRedirect } from 'realia/ui/RealiaRedirect'
import {
  scrollToSection,
  useRealiaSectionState,
} from 'realia/ui/useRealiaSectionState'
import { buildRealiaNav, realiaSectionIds } from 'realia/ui/realiaSections'
import ReferenceList from 'bibliography/ui/ReferenceList'
import SessionContext from 'auth/SessionContext'
import { Session } from 'auth/Session'
import AppContent from 'common/ui/AppContent'
import { SectionCrumb, TextCrumb } from 'common/ui/Breadcrumbs'
import useActiveSection from 'common/hooks/useActiveSection'
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
  const sectionIds = useMemo(
    () => navSections.map((section) => section.id),
    [navSections],
  )
  const anchorIds = useMemo(
    () => [
      realiaSectionIds.top,
      ...navSections.flatMap((section) =>
        section.subsections.length > 0
          ? section.subsections.map((subsection) => subsection.id)
          : [section.id],
      ),
    ],
    [navSections],
  )
  const sectionByAnchor = useMemo(() => {
    const map: Record<string, string> = {}
    navSections.forEach((section) => {
      map[section.id] = section.id
      section.subsections.forEach((subsection) => {
        map[subsection.id] = section.id
      })
    })
    return map
  }, [navSections])
  const { openSections, toggleSection, openSection } =
    useRealiaSectionState(sectionIds)
  const { activeId, selectActiveSection } = useActiveSection(anchorIds)
  const history = useHistory()
  const location = useLocation()
  const selectedId = useMemo(() => {
    const hashId = decodeURIComponent(location.hash.replace(/^#/, ''))
    return hashId || null
  }, [location.hash])
  const typeLabel = entry.type.length > 0 ? entry.type.join(', ') : null

  // Reflect the section/subsection named in the URL hash: open its parent,
  // highlight it as active, and scroll it into view. Runs on load (deep links,
  // cross-references) and whenever a menu click pushes a new hash.
  useEffect(() => {
    if (!selectedId) {
      return
    }
    const sectionId = sectionByAnchor[selectedId]
    if (sectionId) {
      openSection(sectionId)
    }
    selectActiveSection(selectedId)
    scrollToSection(selectedId)
  }, [location, selectedId, sectionByAnchor, openSection, selectActiveSection])

  const navigateToSection = useCallback(
    (id: string): void => {
      history.push({
        pathname: location.pathname,
        search: location.search,
        hash: `#${id}`,
      })
    },
    [history, location.pathname, location.search],
  )

  return (
    <div className="Realia__layout">
      <RealiaNavMenu
        title={entry.id}
        typeLabel={typeLabel}
        topId={realiaSectionIds.top}
        sections={navSections}
        openSections={openSections}
        activeId={activeId}
        selectedId={selectedId}
        onToggleSection={toggleSection}
        onNavigate={navigateToSection}
      />
      <div className="Realia__content">
        <div id={realiaSectionIds.top} className="Realia__top">
          <RealiaDevelopmentNotice />
          <h1>{entry.id}</h1>
          <RealiaMetadata entry={entry} />
        </div>
        {entry.reallexikon.length > 0 && (
          <RealiaSection
            id={realiaSectionIds.reallexikon}
            heading="I. Reallexikon der Assyriologie und Vorderasiatischen Archäologie"
            open={openSections[realiaSectionIds.reallexikon]}
            onToggle={toggleSection}
          >
            <ReallexikonEntries entries={entry.reallexikon} />
          </RealiaSection>
        )}
        {entry.afoRegister.length > 0 && (
          <RealiaSection
            id={realiaSectionIds.afoRegister}
            heading="II. AfO-Register Realien"
            open={openSections[realiaSectionIds.afoRegister]}
            onToggle={toggleSection}
          >
            <AfoRegisterVolumes
              entryId={entry.id}
              volumeGroups={volumeGroups}
            />
          </RealiaSection>
        )}
        {entry.references.length > 0 && (
          <RealiaSection
            id={realiaSectionIds.references}
            heading="III. References"
            open={openSections[realiaSectionIds.references]}
            onToggle={toggleSection}
          >
            <ReferenceList references={entry.references} />
          </RealiaSection>
        )}
        {crossReferences.length > 0 && (
          <RealiaSection
            id={realiaSectionIds.seeAlso}
            heading="IV. See Also"
            open={openSections[realiaSectionIds.seeAlso]}
            onToggle={toggleSection}
          >
            <SeeAlsoList crossReferences={crossReferences} />
          </RealiaSection>
        )}
      </div>
    </div>
  )
}

function RealiaEntryDisplay({
  data: entry,
}: {
  data: RealiaEntry
}): JSX.Element {
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
  WithoutData<{ data: RealiaEntry }>,
  { realiaService: RealiaService; id: string },
  RealiaEntry
>(RealiaEntryDisplay, (props) => props.realiaService.find(props.id), {
  watch: (props) => [props.id],
})
