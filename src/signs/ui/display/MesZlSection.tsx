import React from 'react'
import { Alert, Nav, Tab } from 'react-bootstrap'
import Spinner from 'common/ui/Spinner'
import { MesZlKap2Entry } from 'signs/domain/Sign'
import MesZlText, { MesZlChapter } from 'signs/ui/display/MesZlText'
import {
  BorgerFontCredit,
  MesZlSourceCard,
  mesZlChapters,
} from 'signs/ui/display/MesZlSource'
import { MesZlKap2State } from 'signs/ui/display/useMesZlKap2'

function ChapterContent({
  chapter,
  kap3,
  kap2,
}: {
  chapter: MesZlChapter
  kap3: string
  kap2: readonly MesZlKap2Entry[]
}): JSX.Element {
  return (
    <>
      {chapter === 'kap2' ? (
        kap2.map((entry) => (
          <MesZlText key={entry.number} text={entry.text} chapter="kap2" />
        ))
      ) : (
        <MesZlText text={kap3} chapter="kap3" />
      )}
      <MesZlSourceCard chapter={chapter} />
      <BorgerFontCredit />
    </>
  )
}

function Kap2Status({ state }: { state: MesZlKap2State }): JSX.Element | null {
  if (state.status === 'loading') {
    return (
      <p className="SignPage__note">
        <Spinner>Loading Kapitel Ⅱ…</Spinner>
      </p>
    )
  }
  if (state.status === 'error') {
    return <Alert variant="danger">MesZL Kapitel Ⅱ could not be loaded.</Alert>
  }
  return null
}

function ChapterTabs({
  kap3,
  kap2,
}: {
  kap3: string
  kap2: readonly MesZlKap2Entry[]
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
}): JSX.Element {
  const kap2Entries = kap2.status === 'loaded' ? kap2.entries : []
  const onlyChapter: MesZlChapter = kap3 ? 'kap3' : 'kap2'
  const hasOneChapter = !kap3 || kap2Entries.length === 0
  return (
    <>
      <Kap2Status state={kap2} />
      {hasOneChapter ? (
        (kap3 || kap2Entries.length > 0) && (
          <div className="SignPage__meszl-body">
            <ChapterContent
              chapter={onlyChapter}
              kap3={kap3}
              kap2={kap2Entries}
            />
          </div>
        )
      ) : (
        <ChapterTabs kap3={kap3} kap2={kap2Entries} />
      )}
    </>
  )
}
