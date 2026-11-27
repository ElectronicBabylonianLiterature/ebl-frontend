import React, { useMemo, useState } from 'react'
import withData, { WithoutData } from 'http/withData'
import SignService from 'signs/application/SignService'
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
import useKeepSectionInView from 'signs/ui/display/useKeepSectionInView'
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
  session,
}: {
  sign: Sign
  signService: SignService
  session: Session
}): JSX.Element {
  const kap2 = useMesZlKap2(
    sign.name,
    signService,
    session.isAllowedToReadMesZlKap2(),
  )
  const sections = useMemo(() => buildSignSections(sign, kap2), [sign, kap2])
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
  const hasMesZl = sections.some(({ id }) => id === signSectionIds.meszl)

  return (
    <div className="EntryPage__layout SignPage">
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
              kap2={kap2}
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
}: {
  sign: Sign
  signService: SignService
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
  id: string
}

export default withData<WithoutData<Props>, { id: string }, Sign>(
  ({ data, signService }) => (
    <SignDisplay sign={data} signService={signService} />
  ),
  (props, signal) => props.signService.find(props.id, signal),
  { watch: (props) => [props.id] },
)
