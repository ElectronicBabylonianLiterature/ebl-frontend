import React from 'react'
import { Tabs, Tab } from 'react-bootstrap'
import AppContent from 'common/AppContent'
import { SectionCrumb } from 'common/Breadcrumbs'
import MarkupService from 'markup/application/MarkupService'
import 'about/ui/about.sass'
import AboutProject from 'about/ui/project'
import AboutFragmentarium from 'about/ui/fragmentarium'
import AboutCorpus from 'about/ui/corpus'
import AboutSigns from 'about/ui/signs'
import AboutDictionary from 'about/ui/dictionary'
import AboutChronology from 'about/ui/chronology'
import DateConverterForm from 'chronology/ui/DateConverterForm'

export default function About({
  markupService,
}: {
  markupService: MarkupService
}): JSX.Element {
  return (
    <AppContent title="About" crumbs={[new SectionCrumb('About')]}>
      <Tabs
        id="about"
        defaultActiveKey="fragmentarium"
        mountOnEnter
        unmountOnExit
      >
        <Tab eventKey="project" title="eBL Project">
          {AboutProject(markupService)}
        </Tab>
        <Tab eventKey="fragmentarium" title="Fragmentarium">
          {AboutFragmentarium(markupService)}
        </Tab>
        <Tab eventKey="corpus" title="Corpus">
          {AboutCorpus(markupService)}
        </Tab>
        <Tab eventKey="signs" title="Signs">
          {AboutSigns(markupService)}
        </Tab>
        <Tab eventKey="dictionary" title="Dictionary">
          {AboutDictionary(markupService)}
        </Tab>
        <Tab eventKey="chronology" title="Chronology">
          <Tabs
            id="chronology"
            defaultActiveKey="chronology-kings"
            mountOnEnter
            unmountOnExit
          >
            <Tab eventKey="chronology-dates" title="Dates">
              <DateConverterForm />
            </Tab>
            <Tab eventKey="chronology-kings" title="Kings">
              {AboutChronology()}
            </Tab>
          </Tabs>
        </Tab>
      </Tabs>
    </AppContent>
  )
}
