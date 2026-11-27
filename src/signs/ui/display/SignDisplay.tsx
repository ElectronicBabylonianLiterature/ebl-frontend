import React, { useMemo } from 'react'
import withData, { WithoutData } from 'http/withData'
import SignService from 'signs/application/SignService'
import Sign from 'signs/domain/Sign'
import WordService from 'dictionary/application/WordService'
import AppContent from 'common/ui/AppContent'
import { SectionCrumb, TextCrumb } from 'common/ui/Breadcrumbs'
import SessionContext from 'auth/SessionContext'
import { Session } from 'auth/Session'
import ExternalLink from 'common/ui/ExternalLink'
import EntryNavMenu from 'common/ui/entry-page/EntryNavMenu'
import { EntrySection } from 'common/ui/entry-page/EntrySection'
import { EntryNavSection } from 'common/ui/entry-page/entryNavSections'
import useEntryPageNavigation from 'common/ui/entry-page/useEntryPageNavigation'
import replaceTransliteration from 'fragmentarium/domain/replaceTransliteration'
import SignOverview from 'signs/ui/display/SignOverview'
import MesZlSection from 'signs/ui/display/MesZlSection'
import SignLogogramsByWord from 'signs/ui/display/SignLogogramsByWord'
import SignImages from 'signs/ui/display/SignImages'
import CompositeSigns from 'signs/ui/display/CompositeSigns'
import FosseyDisplay from 'signs/ui/display/SignFossey'
import { HeadTags } from 'router/head'
import 'common/ui/entry-page/EntryPage.sass'
import 'signs/ui/display/SignDisplay.css'
import 'signs/ui/display/SignPage.sass'

export const signSectionIds = {
  top: 'sign-top',
  meszl: 'sign-meszl',
  logograms: 'sign-logograms',
  palaeography: 'sign-palaeography',
  composites: 'sign-composites',
  fossey: 'sign-fossey',
} as const

const sectionLabels: Readonly<Record<string, string>> = {
  [signSectionIds.meszl]: 'Mesopotamisches Zeichenlexikon',
  [signSectionIds.logograms]: 'Logograms',
  [signSectionIds.palaeography]: 'Palaeography',
  [signSectionIds.composites]: 'Composite signs',
  [signSectionIds.fossey]: 'Fossey',
}

export function buildSignSections(
  sign: Sign,
  isAllowedToReadKap2: boolean,
): readonly EntryNavSection[] {
  const present: readonly [string, boolean][] = [
    [signSectionIds.meszl, Boolean(sign.mesZl) || isAllowedToReadKap2],
    [signSectionIds.logograms, sign.logograms.length > 0],
    [signSectionIds.palaeography, true],
    [signSectionIds.composites, true],
    [signSectionIds.fossey, sign.fossey.length > 0],
  ]
  return present
    .filter(([, isPresent]) => isPresent)
    .map(([id]) => ({ id, label: sectionLabels[id], subsections: [] }))
}

function mesZlNumber(sign: Sign): string | undefined {
  return sign.lists.find((record) => record.name === 'MZL')?.number
}

function SignPage({
  sign,
  signService,
  session,
}: {
  sign: Sign
  signService: SignService
  session: Session
}): JSX.Element {
  const isAllowedToReadKap2 = session.isAllowedToReadMesZlKap2()
  const sections = useMemo(
    () => buildSignSections(sign, isAllowedToReadKap2),
    [sign, isAllowedToReadKap2],
  )
  const {
    openSections,
    toggleSection,
    activeId,
    selectedId,
    navigateToSection,
  } = useEntryPageNavigation(signSectionIds.top, sections)
  const number = mesZlNumber(sign)
  const shown = new Set(sections.map((section) => section.id))
  const section = (id: string, children: React.ReactNode): JSX.Element => (
    <EntrySection
      id={id}
      heading={sectionLabels[id]}
      open
      collapsible={false}
      onToggle={toggleSection}
    >
      {children}
    </EntrySection>
  )

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
          number ? `Cuneiform sign · MesZL ${number}` : 'Cuneiform sign'
        }
        topId={signSectionIds.top}
        sections={sections}
        openSections={openSections}
        activeId={activeId}
        selectedId={selectedId}
        onToggleSection={toggleSection}
        onNavigate={navigateToSection}
      />
      <div className="EntryPage__content">
        <div id={signSectionIds.top} className="EntryPage__top">
          <SignOverview sign={sign} />
        </div>
        {shown.has(signSectionIds.meszl) &&
          section(
            signSectionIds.meszl,
            <MesZlSection
              signName={sign.name}
              kap3={sign.mesZl}
              signService={signService}
              isAllowedToReadKap2={isAllowedToReadKap2}
            />,
          )}
        {shown.has(signSectionIds.logograms) &&
          section(
            signSectionIds.logograms,
            <SignLogogramsByWord logograms={sign.logograms} />,
          )}
        {section(
          signSectionIds.palaeography,
          <SignImages signName={sign.name} signService={signService} />,
        )}
        {section(
          signSectionIds.composites,
          <CompositeSigns
            signService={signService}
            query={{
              isComposite: true,
              value: replaceTransliteration(sign.name.toLowerCase()),
              subIndex: 1,
            }}
          />,
        )}
        {shown.has(signSectionIds.fossey) &&
          section(
            signSectionIds.fossey,
            <>
              <FosseyDisplay fosseys={sign.fossey} />
              <p className="SignPage__note">
                From Ch. Fossey,{' '}
                <em>
                  Manuel d’assyriologie, Tome deuxième: Evolution des
                  cunéiformes
                </em>
                . Paris: Conard, 1926 (
                <ExternalLink href="https://www.europeana.eu/en/rights/public-domain-charter">
                  in the public domain
                </ExternalLink>
                ).
              </p>
            </>,
          )}
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
  wordService: WordService
  signService: SignService
  id: string
}

export default withData<WithoutData<Props>, { id: string }, Sign>(
  ({ data, wordService, signService }) => (
    <SignDisplay
      sign={data}
      wordService={wordService}
      signService={signService}
    />
  ),
  (props, signal) => props.signService.find(props.id, signal),
  { watch: (props) => [props.id] },
)
