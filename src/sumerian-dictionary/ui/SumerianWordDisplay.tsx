import React, { useMemo } from 'react'
import withData, { WithoutData } from 'http/withData'
import SessionContext from 'auth/SessionContext'
import { Session } from 'auth/Session'
import AppContent from 'common/ui/AppContent'
import { SectionCrumb, TextCrumb } from 'common/ui/Breadcrumbs'
import EntryNavMenu from 'common/ui/entry-page/EntryNavMenu'
import { EntrySection } from 'common/ui/entry-page/EntrySection'
import useEntryPageNavigation from 'common/ui/entry-page/useEntryPageNavigation'
import MarkupService from 'markup/application/MarkupService'
import SumerianDictionaryService from 'sumerian-dictionary/application/SumerianDictionaryService'
import { SumerianWord } from 'sumerian-dictionary/domain/SumerianWord'
import { getPartOfSpeechLabel } from 'sumerian-dictionary/domain/sumerianDictionaryLabels'
import { getWordTitle } from 'sumerian-dictionary/domain/sumerianWordHelpers'
import SumerianDictionaryDevelopmentNotice from 'sumerian-dictionary/ui/SumerianDictionaryDevelopmentNotice'
import SumerianWordMetadata, {
  SumerianWordHeading,
} from 'sumerian-dictionary/ui/SumerianWordMetadata'
import SumerianWordSectionContent from 'sumerian-dictionary/ui/SumerianWordSectionContent'
import { SumerianRestrictedNotice } from 'sumerian-dictionary/ui/SumerianDictionaryAccess'
import {
  buildSumerianWordSections,
  sumerianWordTopId,
} from 'sumerian-dictionary/ui/sumerianWordSections'
import { HeadTags } from 'router/head'
import 'sumerian-dictionary/ui/SumerianDictionary.sass'

const sectionCrumbs = [
  new SectionCrumb('Tools'),
  new SectionCrumb('Sumerian Dictionary'),
]

export const sumerianWordDescription =
  'Sumerian Dictionary entry at the electronic Babylonian Library (eBL).'

function AuthorizedSumerianWord({
  word,
  markupService,
}: {
  word: SumerianWord
  markupService: MarkupService
}): JSX.Element {
  const sections = useMemo(() => buildSumerianWordSections(word), [word])
  const {
    openSections,
    toggleSection,
    activeId,
    selectedId,
    navigateToSection,
  } = useEntryPageNavigation(sumerianWordTopId, sections)
  const subtitle =
    [word.guideWord, getPartOfSpeechLabel(word)].filter(Boolean).join(' · ') ||
    null
  return (
    <div className="EntryPage__layout SumerianDictionary">
      <EntryNavMenu
        title={getWordTitle(word)}
        subtitle={subtitle}
        topId={sumerianWordTopId}
        sections={sections}
        openSections={openSections}
        activeId={activeId}
        selectedId={selectedId}
        onToggleSection={toggleSection}
        onNavigate={navigateToSection}
      />
      <div className="EntryPage__content">
        <div id={sumerianWordTopId} className="EntryPage__top">
          <SumerianDictionaryDevelopmentNotice />
          <SumerianWordHeading word={word} markupService={markupService} />
          <SumerianWordMetadata word={word} />
        </div>
        {sections.map((section) => (
          <EntrySection
            key={section.id}
            id={section.id}
            heading={section.heading}
            open={openSections[section.id]}
            onToggle={toggleSection}
          >
            <SumerianWordSectionContent section={section} word={word} />
          </EntrySection>
        ))}
      </div>
    </div>
  )
}

function SumerianWordPage({
  data: word,
  markupService,
}: {
  data: SumerianWord
  markupService: MarkupService
}): JSX.Element {
  return (
    <AppContent
      crumbs={[...sectionCrumbs, new TextCrumb(getWordTitle(word))]}
      hideHeading
    >
      <HeadTags
        title={`${getWordTitle(word)} · Sumerian Dictionary - eBL`}
        description={sumerianWordDescription}
      />
      <AuthorizedSumerianWord word={word} markupService={markupService} />
    </AppContent>
  )
}

const SumerianWordWithData = withData<
  WithoutData<{ data: SumerianWord; markupService: MarkupService }>,
  { id: string; sumerianDictionaryService: SumerianDictionaryService },
  SumerianWord
>(
  SumerianWordPage,
  (props, signal) => props.sumerianDictionaryService.find(props.id, signal),
  { watch: (props) => [props.id] },
)

export default function SumerianWordDisplay(props: {
  id: string
  sumerianDictionaryService: SumerianDictionaryService
  markupService: MarkupService
}): JSX.Element {
  return (
    <SessionContext.Consumer>
      {(session: Session): JSX.Element =>
        session.isAllowedToReadSumerianWords() ? (
          <SumerianWordWithData {...props} />
        ) : (
          <AppContent crumbs={sectionCrumbs} hideHeading>
            <SumerianRestrictedNotice />
          </AppContent>
        )
      }
    </SessionContext.Consumer>
  )
}
