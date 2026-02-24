import React from 'react'
import { Tabs, Tab } from 'react-bootstrap'
import _ from 'lodash'
import Promise from 'bluebird'
import ChapterManuscripts from 'corpus/ui/manuscripts/ChapterManuscripts'
import ChapterLines from 'corpus/ui/lines/ChapterLines'
import ChapterAligner from 'corpus/ui/alignment/ChapterAligner'
import ChapterDetails from './ChapterDetails'
import { Chapter } from 'corpus/domain/chapter'
import BibliographyEntry from 'bibliography/domain/BibliographyEntry'
import FragmentService from 'fragmentarium/application/FragmentService'
import ChapterLemmatizer from 'corpus/ui/lemmatization/ChapterLemmatization'
import TextService from 'corpus/application/TextService'
import { ChapterLemmatization } from 'corpus/domain/lemmatization'
import { ChapterAlignment } from 'corpus/domain/alignment'
import ChapterImport from './import/ChapterImport'

interface Props {
  onSaveLines: () => void
  onSaveManuscripts: () => void
  onSaveAlignment: (alignment: ChapterAlignment) => void
  onSaveLemmatization: (lemmatization: ChapterLemmatization) => void
  onImport: (atf: string) => unknown
  disabled: boolean
  dirty: boolean
  chapter: Chapter
  searchBibliography: (query: string) => Promise<readonly BibliographyEntry[]>
  onChange: (chaper: Chapter) => void
  fragmentService: FragmentService
  textService: TextService
}

export default function ChapterEditor({
  onSaveLines,
  onSaveManuscripts,
  onSaveAlignment,
  onSaveLemmatization,
  onImport,
  disabled,
  dirty,
  chapter,
  searchBibliography,
  onChange,
  fragmentService,
  textService,
}: Props): JSX.Element {
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
            fragmentService={fragmentService}
          />
        </Tab>
        <Tab eventKey="import" title="Import" disabled={dirty}>
          <ChapterImport onSave={onImport} disabled={disabled} />
        </Tab>
        <Tab eventKey="lines" title="Lines" disabled={dirty}>
          <ChapterLines
            chapter={chapter}
            onChange={onChange}
            onSave={onSaveLines}
            disabled={disabled}
          />
        </Tab>
        <Tab eventKey="alignment" title="Alignment" disabled={dirty}>
          <ChapterAligner
            chapter={chapter}
            onSave={onSaveAlignment}
            disabled={disabled}
          />
        </Tab>
        <Tab eventKey="lemmatization" title="Lemmatization" disabled={dirty}>
          <ChapterLemmatizer
            chapter={chapter}
            onSave={onSaveLemmatization}
            disabled={disabled}
            fragmentService={fragmentService}
            textService={textService}
          />
        </Tab>
      </Tabs>
    </>
  )
}
