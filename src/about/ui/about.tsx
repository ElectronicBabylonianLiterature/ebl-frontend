import React, { useEffect, useState } from 'react'
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
import AboutNews from 'about/ui/news'
import AboutDictionary from 'about/ui/dictionary'
import AboutBibliography from 'about/ui/bibliography'
import _ from 'lodash'

export const tabIds = [
  'project',
  'library',
  'corpus',
  'signs',
  'dictionary',
  'bibliography',
  'news',
] as const
export type TabId = typeof tabIds[number]

function getTabs({
  markupService,
  activeSection,
}: {
  markupService: MarkupService
  activeSection?: string
}): React.ReactElement[] {
  return [
    <Tab key="project" eventKey="project" title="eBL Project">
      {AboutProject(markupService)}
    </Tab>,
    <Tab key="library" eventKey="library" title="Library">
      {AboutFragmentarium(markupService)}
    </Tab>,
    <Tab key="corpus" eventKey="corpus" title="Corpus">
      {AboutCorpus(markupService)}
    </Tab>,
    <Tab key="signs" eventKey="signs" title="Signs">
      {AboutSigns(markupService)}
    </Tab>,
    <Tab key="dictionary" eventKey="dictionary" title="Dictionary">
      {AboutDictionary(markupService)}
    </Tab>,
    <Tab key="bibliography" eventKey="bibliography" title="Bibliography">
      {AboutBibliography(markupService)}
    </Tab>,
    <Tab key="news" eventKey="news" title="News">
      {AboutNews({
        activeNewsletterNumber: activeSection
          ? parseInt(activeSection)
          : undefined,
      })}
    </Tab>,
  ]
}

export default function About({
  markupService,
  activeTab,
  activeSection,
}: {
  markupService: MarkupService
  activeTab: TabId
  activeSection?: string
}): JSX.Element {
  const history = useHistory()
  const [selectedTab, setSelectedTab] = useState(activeTab)
  const handleSelect = (newTab: TabId) => {
    if (newTab === activeTab) {
      return
    }
    history.push(`/about/${newTab}`)
    setSelectedTab(newTab)
  }

  useEffect(() => {
    if (activeTab === selectedTab) {
      return
    }
    setSelectedTab(activeTab)
  }, [selectedTab, activeTab])

  return (
    <AppContent
      title="About"
      crumbs={[
        new TextCrumb('About'),
        new TextCrumb(_.capitalize(selectedTab)),
        ...(selectedTab === 'news'
          ? [new TextCrumb(`Nr. ${activeSection}`)]
          : []),
      ]}
    >
      <Tabs
        id="about"
        defaultActiveKey={selectedTab}
        activeKey={selectedTab}
        onSelect={(newTab) => handleSelect(newTab as TabId)}
        mountOnEnter
        unmountOnExit
      >
        {getTabs({ activeSection, markupService })}
      </Tabs>
    </AppContent>
  )
}
