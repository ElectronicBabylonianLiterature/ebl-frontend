import React, { useContext } from 'react'
import { Tabs, Tab } from 'react-bootstrap'
import _ from 'lodash'
import ChapterManuscripts from './manuscripts/ChapterManuscripts'
import ChapterLines from './lines/ChapterLines'
import ChapterAlignment from 'corpus/alignment/ChapterAlignment'
import SessionContext from 'auth/SessionContext'
import ChapterDetails from './ChapterDetails'

export default function ChapterEditor({
  onSaveLines,
  onSaveManuscripts,
  onSaveAlignment,
  disabled,
  dirty,
  chapter,
  searchBibliography,
  onChange
}) {
  const session = useContext(SessionContext)
  return (
    <>
      <ChapterDetails chapter={chapter} />
      <Tabs
        defaultActiveKey="manuscripts"
        id={_.uniqueId('ChapterFormTabs-')}
        mountOnEnter
        unmountOnExit
      >
        <Tab eventKey="manuscripts" title="Manuscripts" disabled={dirty}>
          <ChapterManuscripts
            chapter={chapter}
            searchBibliography={searchBibliography}
            onChange={onChange}
            onSave={onSaveManuscripts}
            disabled={disabled}
          />
        </Tab>
        <Tab eventKey="lines" title="Lines" disabled={dirty}>
          <ChapterLines
            chapter={chapter}
            onChange={onChange}
            onSave={onSaveLines}
            disabled={disabled}
          />
        </Tab>
        <Tab
          eventKey="alignment"
          title="Alignment"
          disabled={!session.hasBetaAccess() || dirty}
        >
          <ChapterAlignment
            chapter={chapter}
            onChange={onChange}
            onSave={onSaveAlignment}
            disabled={disabled}
          />
        </Tab>
      </Tabs>
    </>
  )
}
