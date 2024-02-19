import React, { useState } from 'react'
import { Tabs, Tab } from 'react-bootstrap'
import { useHistory } from 'react-router-dom'
import AppContent from 'common/AppContent'
import { TextCrumb } from 'common/Breadcrumbs'
import MarkupService from 'markup/application/MarkupService'
import 'about/ui/about.sass'
import AboutProject from 'about/ui/project'
import AboutFragmentarium from 'about/ui/fragmentarium'
import AboutCorpus from 'about/ui/corpus'
import AboutSigns from 'about/ui/signs'
import AboutDictionary from 'about/ui/dictionary'
import AboutBibliography from 'about/ui/bibliography'
import _ from 'lodash'

export const tabIds = [
  'project',
  'fragmentarium',
  'corpus',
  'signs',
  'dictionary',
  'bibliography',
  'news',
] as const
export type TabId = typeof tabIds[number]

export default function About({
  markupService,
  activeTab,
}: {
  markupService: MarkupService
  activeTab: TabId
}): JSX.Element {
  const history = useHistory()
  const [selectedTab, setSelectedTab] = useState(activeTab)
  const handleSelect = (selectedTab: TabId) => {
    history.push(selectedTab)
    setSelectedTab(selectedTab)
  }
  return (
    <AppContent
      title="About"
      crumbs={[
        new TextCrumb('About'),
        new TextCrumb(_.capitalize(selectedTab)),
      ]}
    >
      <Tabs
        id="about"
        defaultActiveKey={selectedTab}
        onSelect={(selectedTab) => handleSelect(selectedTab as TabId)}
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
          {AboutSigns()}
        </Tab>
        <Tab eventKey="dictionary" title="Dictionary">
          {AboutDictionary(markupService)}
        </Tab>
        <Tab eventKey="bibliography" title="Bibliography">
          {AboutBibliography(markupService)}
        </Tab>
      </Tabs>
    </AppContent>
  )
}
