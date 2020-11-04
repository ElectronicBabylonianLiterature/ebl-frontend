import React, { useContext } from 'react'
import { Tabs, Tab } from 'react-bootstrap'
import _ from 'lodash'
import Promise from 'bluebird'
import ChapterManuscripts from 'corpus/ui/manuscripts/ChapterManuscripts'
import ChapterLines from 'corpus/ui/lines/ChapterLines'
import ChapterAlignment from 'corpus/ui/alignment/ChapterAlignment'
import SessionContext from 'auth/SessionContext'
import ChapterDetails from './ChapterDetails'
import { Chapter } from 'corpus/domain/text'
import BibliographyEntry from 'bibliography/domain/BibliographyEntry'
import FragmentService from 'fragmentarium/application/FragmentService'
import ChapterLemmatization from './lemmatization/ManuscriptLineLemmatizer'

interface Props {
  onSaveLines: () => void
  onSaveManuscripts: () => void
  onSaveAlignment: () => void
  onSaveLemmatization: () => void
  disabled: boolean
  dirty: boolean
  chapter: Chapter
  searchBibliography: (query: string) => Promise<readonly BibliographyEntry[]>
  onChange: (chaper: Chapter) => void
  fragmentService: FragmentService
}

export default function ChapterEditor({
  onSaveLines,
  onSaveManuscripts,
  onSaveAlignment,
  onSaveLemmatization,
  disabled,
  dirty,
  chapter,
  searchBibliography,
  onChange,
  fragmentService,
}: Props): JSX.Element {
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
        <Tab
          eventKey="lemmatization"
          title="Lemmatization"
          disabled={!session.hasBetaAccess() || dirty}
        >
          <ChapterLemmatization
            chapter={chapter}
            onChange={onChange}
            onSave={onSaveLemmatization}
            disabled={disabled}
            fragmentService={fragmentService}
          />
        </Tab>
      </Tabs>
    </>
  )
}
