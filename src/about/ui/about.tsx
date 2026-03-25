import React, { useEffect, useState } from 'react'
import { Container, Row, Col, Nav } from 'react-bootstrap'
import { useLocation } from 'react-router-dom'
import { TextCrumb } from 'common/Breadcrumbs'
import MarkupService from 'markup/application/MarkupService'
import 'about/ui/about.sass'
import AboutProject from 'about/ui/project'
import AboutLibrary from 'about/ui/library'
import AboutCorpus from 'about/ui/corpus'
import AboutSigns from 'about/ui/signs'
import AboutDictionary from 'about/ui/dictionary'
import AboutBibliography from 'about/ui/bibliography'
import _ from 'lodash'
import Breadcrumbs from 'common/Breadcrumbs'
import { useHistory } from 'router/compat'

export const tabIds = [
  'project',
  'library',
  'corpus',
  'signs',
  'dictionary',
  'bibliography',
] as const
export type TabId = (typeof tabIds)[number]

type TabConfig = {
  id: TabId
  title: string
  icon: string
}

const tabConfig: TabConfig[] = [
  { id: 'project', title: 'eBL Project', icon: '⚙' },
  { id: 'library', title: 'Library', icon: '⌂' },
  { id: 'corpus', title: 'Corpus', icon: '⊞' },
  { id: 'signs', title: 'Signs', icon: '𒀀' },
  { id: 'dictionary', title: 'Dictionary', icon: 'Ꞌ' },
  { id: 'bibliography', title: 'Bibliography', icon: '※' },
]

const tabContent: Record<
  TabId,
  (markupService: MarkupService) => React.ReactElement
> = {
  project: AboutProject,
  library: AboutLibrary,
  corpus: AboutCorpus,
  signs: AboutSigns,
  dictionary: AboutDictionary,
  bibliography: AboutBibliography,
}

function getContent({
  markupService,
  activeTab,
  activeSection,
}: {
  markupService: MarkupService
  activeTab: TabId
  activeSection?: string
}): React.ReactElement {
  const contentResolver = tabContent[activeTab] ?? tabContent.project
  return contentResolver(markupService)
}

function AboutNavItem({
  tab,
  isActive,
  onSelect,
}: {
  tab: TabConfig
  isActive: boolean
  onSelect: (tabId: TabId) => void
}): JSX.Element {
  return (
    <Nav.Link
      className={`about-nav__item ${isActive ? 'active' : ''}`}
      onClick={() => onSelect(tab.id)}
    >
      <span className="about-nav__icon">{tab.icon}</span>
      <span className="about-nav__title">{tab.title}</span>
    </Nav.Link>
  )
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
  const location = useLocation()
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

  useEffect(() => {
    const hash = location.hash
    if (hash) {
      const id = hash.replace('#', '')
      setTimeout(() => {
        const element = document.getElementById(id)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' })
        }
      }, 400)
    }
  }, [location])

  const currentTab = tabConfig.find((tab) => tab.id === selectedTab)

  return (
    <>
      <div className="about-header">
        <Container>
          <Breadcrumbs
            className="about-header__breadcrumbs"
            crumbs={[
              new TextCrumb('About'),
              new TextCrumb(_.capitalize(selectedTab)),
            ]}
          />
          <h1 className="about-header__title">About</h1>
        </Container>
      </div>

      <Container className="about-container">
        <Row>
          <Col md={3} className="about-sidebar">
            <Nav className="flex-column about-nav">
              {tabConfig.map((tab) => (
                <AboutNavItem
                  key={tab.id}
                  tab={tab}
                  isActive={selectedTab === tab.id}
                  onSelect={handleSelect}
                />
              ))}
            </Nav>
          </Col>

          <Col md={9} className="about-content">
            <div className="about-content__header">
              <span className="about-content__icon">{currentTab?.icon}</span>
              <h2 className="about-content__title">{currentTab?.title}</h2>
            </div>
            <div className="about-content__body">
              {getContent({ markupService, activeTab, activeSection })}
            </div>
          </Col>
        </Row>
      </Container>
    </>
  )
}
