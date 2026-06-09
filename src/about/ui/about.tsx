import React, { useEffect, useState } from 'react'
import { Container, Row, Col, Nav } from 'react-bootstrap'
import { Link, useLocation } from 'react-router-dom'
import AppContent from 'common/ui/AppContent'
import { SectionCrumb, TextCrumb } from 'common/ui/Breadcrumbs'
import MarkupService from 'markup/application/MarkupService'
import 'about/ui/about.sass'
import AboutProject from 'about/ui/project'
import AboutFragmentarium from 'about/ui/fragmentarium'
import AboutCorpus from 'about/ui/corpus'
import AboutSigns from 'about/ui/signs'
import AboutDictionary from 'about/ui/dictionary'
import AboutBibliography from 'about/ui/bibliography'
import AboutNews from 'about/ui/news'
import AboutArchaeology from 'about/ui/archaeology'
import _ from 'lodash'
import useScrollToHash from 'common/hooks/useScrollToHash'

export const tabIds = [
  'project',
  'library',
  'corpus',
  'signs',
  'akkadian-dictionary',
  'bibliography',
  'news',
  'archaeology',
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
  { id: 'akkadian-dictionary', title: 'Akkadian Dictionary', icon: 'Ꞌ' },
  { id: 'bibliography', title: 'Bibliography', icon: '※' },
  { id: 'news', title: 'News', icon: '✉' },
  { id: 'archaeology', title: 'Archaeology', icon: '⛏' },
]

const tabContent: Record<
  Exclude<TabId, 'news'>,
  (markupService: MarkupService) => React.ReactElement
> = {
  project: AboutProject,
  library: AboutFragmentarium,
  corpus: AboutCorpus,
  signs: AboutSigns,
  'akkadian-dictionary': AboutDictionary,
  bibliography: AboutBibliography,
  archaeology: AboutArchaeology,
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
  if (activeTab === 'news') {
    return (
      <AboutNews
        activeNewsletterNumber={
          activeSection ? parseInt(activeSection) : undefined
        }
      />
    )
  }
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
      as={Link}
      to={`/about/${tab.id}`}
      className={`about-nav__item ${isActive ? 'active' : ''}`}
      onClick={() => onSelect(tab.id)}
    >
      <span className="about-nav__icon" aria-hidden="true">
        {tab.icon}
      </span>
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
  const location = useLocation()
  const [selectedTab, setSelectedTab] = useState(activeTab)

  const handleSelect = (newTab: TabId) => {
    if (newTab === selectedTab) {
      return
    }
    setSelectedTab(newTab)
    window.scrollTo(0, 0)
  }

  useEffect(() => {
    setSelectedTab(activeTab)
  }, [activeTab])

  useScrollToHash(location.hash)

  const currentTab = tabConfig.find((tab) => tab.id === selectedTab)

  return (
    <AppContent
      crumbs={[
        new SectionCrumb('About'),
        new TextCrumb(currentTab?.title ?? _.capitalize(selectedTab)),
      ]}
      title="About"
    >
      <Container className="about-container">
        <Row>
          <Col xs={12} md={3} className="about-sidebar">
            <Nav
              as="nav"
              aria-label="About sections"
              className="flex-column about-nav"
            >
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

          <Col xs={12} md={9} className="about-content">
            <div className="about-content__header">
              <span className="about-content__icon" aria-hidden="true">
                {currentTab?.icon}
              </span>
              <h2 className="about-content__title">{currentTab?.title}</h2>
            </div>
            <div className="about-content__body">
              {getContent({
                markupService,
                activeTab: selectedTab,
                activeSection,
              })}
            </div>
          </Col>
        </Row>
      </Container>
    </AppContent>
  )
}
