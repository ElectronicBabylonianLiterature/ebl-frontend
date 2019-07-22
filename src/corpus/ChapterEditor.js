import React from 'react'
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
  chapter,
  searchBibliography,
  onChange
}) {
  return (
    <SessionContext.Consumer>
      {session => (
        <>
          <ChapterDetails chapter={chapter} />
          <Tabs
            defaultActiveKey="manuscripts"
            id={_.uniqueId('ChapterFormTabs-')}
            mountOnEnter
            unmountOnExit
          >
            <Tab eventKey="manuscripts" title="Manuscripts">
              <ChapterManuscripts
                chapter={chapter}
                searchBibliography={searchBibliography}
                onChange={onChange}
                onSave={onSaveManuscripts}
                disabled={disabled}
              />
            </Tab>
            <Tab eventKey="lines" title="Lines">
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
              disabled={!session.hasBetaAccess()}
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
      )}
    </SessionContext.Consumer>
  )
}
