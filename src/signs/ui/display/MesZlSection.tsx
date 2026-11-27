import React from 'react'
import { Alert, Nav, Tab } from 'react-bootstrap'
import Spinner from 'common/ui/Spinner'
import MesZlText, { MesZlChapter } from 'signs/ui/display/MesZlText'
import {
  BorgerFontCredit,
  MesZlSourceCard,
  mesZlChapters,
} from 'signs/ui/display/MesZlSource'
import { MesZlKap2State } from 'signs/ui/display/useMesZlKap2'
import { isPendingOrNonEmpty } from 'common/hooks/useRequestState'

function Kap2Entries({ state }: { state: MesZlKap2State }): JSX.Element {
  switch (state.status) {
    case 'loaded':
      return (
        <>
          {state.data.map((entry) => (
            <MesZlText key={entry.number} text={entry.text} chapter="kap2" />
          ))}
        </>
      )
    case 'error':
      return (
        <Alert variant="danger">MesZL Kapitel Ⅱ could not be loaded.</Alert>
      )
    default:
      return (
        <p className="SignPage__note">
          <Spinner>Loading Kapitel Ⅱ…</Spinner>
        </p>
      )
  }
}

function ChapterContent({
  chapter,
  kap3,
  kap2,
}: {
  chapter: MesZlChapter
  kap3: string
  kap2: MesZlKap2State
}): JSX.Element {
  return (
    <>
      {chapter === 'kap2' ? (
        <Kap2Entries state={kap2} />
      ) : (
        <MesZlText text={kap3} chapter="kap3" />
      )}
      <MesZlSourceCard chapter={chapter} />
      <BorgerFontCredit />
    </>
  )
}

function ChapterTabs({
  kap3,
  kap2,
}: {
  kap3: string
  kap2: MesZlKap2State
}): JSX.Element {
  const chapters: readonly MesZlChapter[] = ['kap3', 'kap2']
  return (
    <Tab.Container
      id="sign-meszl"
      defaultActiveKey="kap3"
      transition={false}
      mountOnEnter
      unmountOnExit
    >
      <Nav
        variant="tabs"
        className="SignPage__meszl-tabs"
        aria-label="MesZL chapters"
      >
        {chapters.map((chapter) => (
          <Nav.Item key={chapter}>
            <Nav.Link as="button" type="button" eventKey={chapter}>
              {mesZlChapters[chapter].tab}
            </Nav.Link>
          </Nav.Item>
        ))}
      </Nav>
      <Tab.Content className="SignPage__meszl-body SignPage__meszl-body--tabbed">
        {chapters.map((chapter) => (
          <Tab.Pane key={chapter} eventKey={chapter} tabIndex={0}>
            <ChapterContent chapter={chapter} kap3={kap3} kap2={kap2} />
          </Tab.Pane>
        ))}
      </Tab.Content>
    </Tab.Container>
  )
}

export default function MesZlSection({
  kap3,
  kap2,
}: {
  kap3: string
  kap2: MesZlKap2State
}): JSX.Element | null {
  const showKap2 = isPendingOrNonEmpty(kap2)
  if (kap3 && showKap2) {
    return <ChapterTabs kap3={kap3} kap2={kap2} />
  }
  if (!kap3 && !showKap2) {
    return null
  }
  return (
    <div className="SignPage__meszl-body">
      <ChapterContent
        chapter={kap3 ? 'kap3' : 'kap2'}
        kap3={kap3}
        kap2={kap2}
      />
    </div>
  )
}
