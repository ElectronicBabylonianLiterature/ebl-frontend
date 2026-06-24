import React, { useCallback, useEffect, useMemo, useState } from 'react'
import classNames from 'classnames'
import { Link } from 'react-router-dom'
import { Collapse } from 'react-bootstrap'
import withData, { WithoutData } from 'http/withData'
import RealiaService from 'realia/application/RealiaService'
import {
  AfoRegisterVolumeEntry,
  AfoRegisterVolumeGroup,
  ReallexikonEntry,
  RealiaCrossReference,
  RealiaEntry,
  getRealiaCrossReferences,
  groupAfoRegisterByVolume,
  formatAfoRegisterVolumeTitle,
  rlaArticleUrl,
} from 'realia/domain/RealiaEntry'
import ExternalLink from 'common/ui/ExternalLink'
import RealiaDevelopmentNotice from 'realia/ui/RealiaDevelopmentNotice'
import RealiaNavMenu from 'realia/ui/RealiaNavMenu'
import {
  afoVolumeId,
  buildRealiaNav,
  realiaSectionIds,
} from 'realia/ui/realiaSections'
import ReferenceList from 'bibliography/ui/ReferenceList'
import SessionContext from 'auth/SessionContext'
import { Session } from 'auth/Session'
import AppContent from 'common/ui/AppContent'
import { SectionCrumb, TextCrumb } from 'common/ui/Breadcrumbs'
import useActiveSection from 'common/hooks/useActiveSection'
import prefersReducedMotion from 'common/utils/prefersReducedMotion'
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

function RealiaSection({
  id,
  heading,
  open,
  onToggle,
  children,
}: {
  id: string
  heading: string
  open: boolean
  onToggle: (id: string) => void
  children: React.ReactNode
}): JSX.Element {
  return (
    <section id={id} className="Realia__section">
      <h2 className="Realia__section-heading">
        <button
          type="button"
          className="Realia__section-toggle"
          aria-expanded={open}
          onClick={(): void => onToggle(id)}
        >
          <i
            className={classNames('fas', 'Realia__section-caret', {
              'fa-caret-down': open,
              'fa-caret-right': !open,
            })}
            aria-hidden="true"
          />
          {heading}
        </button>
      </h2>
      <Collapse in={open}>
        <div>{children}</div>
      </Collapse>
    </section>
  )
}

function ReallexikonEntries({
  entries,
}: {
  entries: readonly ReallexikonEntry[]
}): JSX.Element {
  return (
    <>
      {entries.map((entry, index) => (
        <div key={`${entry.id}-${index}`} className="Realia__rla-article">
          <h3 className="Realia__rla-title">
            {entry.title}
            <ExternalLink
              href={rlaArticleUrl(entry.id)}
              className="Realia__rla-title-link"
              aria-label={`Open ${entry.title} on the online RlA`}
            >
              <i className="fas fa-external-link-alt" aria-hidden="true" />
            </ExternalLink>
          </h3>
          {entry.reference && (
            <div className="Realia__rla-references">
              <ReferenceList references={[entry.reference]} />
            </div>
          )}
        </div>
      ))}
    </>
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
    afoEntry.reference ||
    afoEntry.crossReference,
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
      {afoEntry.crossReference && (
        <p className="Realia__afo-cross-reference">
          <i className="fas fa-arrow-right" aria-hidden="true" />
          <Link
            to={`/tools/realia/${encodeURIComponent(afoEntry.crossReference)}`}
          >
            {afoEntry.crossReference}
          </Link>
        </p>
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

function AfoRegisterVolumes({
  entryId,
  volumeGroups,
}: {
  entryId: string
  volumeGroups: readonly AfoRegisterVolumeGroup[]
}): JSX.Element {
  return (
    <>
      {volumeGroups.map((group, index) => (
        <AfoRegisterVolume
          key={group.volume}
          id={afoVolumeId(index)}
          entryId={entryId}
          group={group}
        />
      ))}
    </>
  )
}

function SeeAlsoList({
  crossReferences,
}: {
  crossReferences: readonly RealiaCrossReference[]
}): JSX.Element {
  return (
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
  )
}

function useRealiaSectionState(sectionIds: readonly string[]): {
  openSections: Record<string, boolean>
  toggleSection: (id: string) => void
  openSection: (id: string) => void
} {
  const initialState = useMemo(
    () => Object.fromEntries(sectionIds.map((id) => [id, true])),
    [sectionIds],
  )
  const [openSections, setOpenSections] =
    useState<Record<string, boolean>>(initialState)

  useEffect(() => {
    setOpenSections(initialState)
  }, [initialState])

  const toggleSection = useCallback((id: string): void => {
    setOpenSections((previous) => ({ ...previous, [id]: !previous[id] }))
  }, [])

  const openSection = useCallback((id: string): void => {
    setOpenSections((previous) => ({ ...previous, [id]: true }))
  }, [])

  return { openSections, toggleSection, openSection }
}

function scrollToSection(id: string): void {
  const behavior = prefersReducedMotion() ? 'auto' : 'smooth'
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ behavior })
    })
  })
}

function AuthorizedRealiaEntry({ entry }: { entry: RealiaEntry }): JSX.Element {
  const crossReferences = useMemo(
    () => getRealiaCrossReferences(entry),
    [entry],
  )
  const volumeGroups = useMemo(
    () => [...groupAfoRegisterByVolume(entry.afoRegister)].reverse(),
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
  const { openSections, toggleSection, openSection } =
    useRealiaSectionState(sectionIds)
  const { activeId, selectActiveSection } = useActiveSection(anchorIds)
  const typeLabel = entry.type.length > 0 ? entry.type.join(', ') : null

  const navigateToSection = useCallback(
    (id: string, sectionId: string): void => {
      openSection(sectionId)
      selectActiveSection(id)
      scrollToSection(id)
    },
    [openSection, selectActiveSection],
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
  return (
    <AppContent
      crumbs={[new SectionCrumb('Realia'), new TextCrumb(entry.id)]}
      hideHeading
    >
      <SessionContext.Consumer>
        {(session: Session): JSX.Element =>
          session.isAllowedToReadRealia() ? (
            <AuthorizedRealiaEntry entry={entry} />
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
>(RealiaEntryDisplay, (props) => props.realiaService.find(props.id), {
  watch: (props) => [props.id],
})
