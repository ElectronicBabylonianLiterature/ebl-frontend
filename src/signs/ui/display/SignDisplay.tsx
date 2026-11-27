import React, { useMemo, useState } from 'react'
import withData, { WithoutData } from 'http/withData'
import SignService from 'signs/application/SignService'
import WordService from 'dictionary/application/WordService'
import Sign from 'signs/domain/Sign'
import AppContent from 'common/ui/AppContent'
import { SectionCrumb, TextCrumb } from 'common/ui/Breadcrumbs'
import SessionContext from 'auth/SessionContext'
import { Session } from 'auth/Session'
import EntryNavMenu from 'common/ui/entry-page/EntryNavMenu'
import { EntrySection } from 'common/ui/entry-page/EntrySection'
import useEntryPageNavigation from 'common/ui/entry-page/useEntryPageNavigation'
import SignOverview from 'signs/ui/display/SignOverview'
import SignSectionContent from 'signs/ui/display/SignSectionContent'
import useMesZlKap2 from 'signs/ui/display/useMesZlKap2'
import useCompositeSigns from 'signs/ui/display/useCompositeSigns'
import { isPendingOrNonEmpty } from 'common/hooks/useRequestState'
import useKeepSectionInView from 'common/ui/entry-page/useKeepSectionInView'
import {
  buildSignSections,
  signSectionIds,
  signTopId,
} from 'signs/ui/display/signSections'
import { HeadTags } from 'router/head'
import 'common/ui/entry-page/EntryPage.sass'
import 'signs/ui/display/CuneiformFonts.css'
import 'signs/ui/display/SignDisplay.css'
import 'signs/ui/display/SignPage.sass'

function SignPage({
  sign,
  signService,
  wordService,
  session,
}: {
  sign: Sign
  signService: SignService
  wordService: WordService
  session: Session
}): JSX.Element {
  const kap2 = useMesZlKap2(
    sign,
    signService,
    session.isAllowedToReadMesZlKap2(),
  )
  const composites = useCompositeSigns(sign, signService)
  const hasMesZl = Boolean(sign.mesZl) || isPendingOrNonEmpty(kap2)
  const hasComposites = isPendingOrNonEmpty(composites)
  const sections = useMemo(
    () =>
      buildSignSections(sign, { mesZl: hasMesZl, composites: hasComposites }),
    [sign, hasMesZl, hasComposites],
  )
  const {
    openSections,
    toggleSection,
    activeId,
    selectedId,
    navigateToSection,
  } = useEntryPageNavigation(signTopId, sections)
  const [content, setContent] = useState<HTMLDivElement | null>(null)
  useKeepSectionInView(selectedId, content)
  const numbers = sign.mesZlNumbers

  return (
    <div className="EntryPage__layout SignPage">
      <div id={signTopId} className="EntryPage__top">
        <SignOverview
          sign={sign}
          onShowMesZl={
            hasMesZl
              ? (): void => navigateToSection(signSectionIds.meszl)
              : null
          }
        />
      </div>
      <EntryNavMenu
        title={
          <>
            {sign.displaySignName}{' '}
            <span className="SignPage__nav-glyph" aria-hidden="true">
              {sign.displayCuneiformSigns}
            </span>
          </>
        }
        subtitle={
          numbers.length > 0
            ? `Cuneiform sign · MesZL ${numbers.join(', ')}`
            : 'Cuneiform sign'
        }
        topId={signTopId}
        sections={sections}
        openSections={openSections}
        activeId={activeId}
        selectedId={selectedId}
        onToggleSection={toggleSection}
        onNavigate={navigateToSection}
      />
      <div className="EntryPage__content" ref={setContent}>
        {sections.map((section) => (
          <EntrySection
            key={section.id}
            id={section.id}
            heading={section.label}
            open={openSections[section.id]}
            collapsible={section.collapsible}
            onToggle={toggleSection}
          >
            <SignSectionContent
              id={section.id}
              sign={sign}
              signService={signService}
              wordService={wordService}
              kap2={kap2}
              composites={composites}
            />
          </EntrySection>
        ))}
      </div>
    </div>
  )
}

function SignDisplay({
  sign,
  signService,
  wordService,
}: {
  sign: Sign
  signService: SignService
  wordService: WordService
}): JSX.Element {
  return (
    <SessionContext.Consumer>
      {(session: Session): JSX.Element => (
        <AppContent
          crumbs={[
            new SectionCrumb('Signs'),
            new TextCrumb(sign.displaySignName),
          ]}
          hideHeading
        >
          {session.isAllowedToReadWords() ? (
            <>
              <HeadTags
                title={`Cuneiform sign ${sign.displaySignName}: eBL`}
                description={`Detailed information on the cuneiform sign ${sign.displaySignName} at the electronic Babylonian Library (eBL).`}
              />
              <SignPage
                sign={sign}
                signService={signService}
                wordService={wordService}
                session={session}
              />
            </>
          ) : (
            <p>Please log in to browse the Signs.</p>
          )}
        </AppContent>
      )}
    </SessionContext.Consumer>
  )
}

type Props = {
  data: Sign
  signService: SignService
  wordService: WordService
  id: string
}

export default withData<WithoutData<Props>, { id: string }, Sign>(
  ({ data, signService, wordService }) => (
    <SignDisplay
      sign={data}
      signService={signService}
      wordService={wordService}
    />
  ),
  (props, signal) => props.signService.find(props.id, signal),
  { watch: (props) => [props.id] },
)
