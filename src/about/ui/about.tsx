import React, { useEffect, useState } from 'react'
import { Container, Row, Col, Nav } from 'react-bootstrap'
import { useHistory, useLocation } from 'react-router-dom'
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
import Breadcrumbs from 'common/Breadcrumbs'

export const tabIds = [
  'project',
  'library',
  'corpus',
  'signs',
  'dictionary',
  'bibliography',
] as const
export type TabId = typeof tabIds[number]

const tabConfig = [
  { id: 'project', title: 'eBL Project', icon: '◆' },
  { id: 'library', title: 'Fragmentarium', icon: '⊞' },
  { id: 'corpus', title: 'Corpus', icon: '⊟' },
  { id: 'signs', title: 'Signs', icon: '𒀀' },
  { id: 'dictionary', title: 'Dictionary', icon: 'Aa' },
  { id: 'bibliography', title: 'Bibliography', icon: '⊞' },
]

function getContent({
  markupService,
  activeTab,
  activeSection,
}: {
  markupService: MarkupService
  activeTab: TabId
  activeSection?: string
}): React.ReactElement {
  switch (activeTab) {
    case 'project':
      return AboutProject(markupService)
    case 'library':
      return AboutFragmentarium(markupService)
    case 'corpus':
      return AboutCorpus(markupService)
    case 'signs':
      return AboutSigns(markupService)
    case 'dictionary':
      return AboutDictionary(markupService)
    case 'bibliography':
      return AboutBibliography(markupService)
    default:
      return AboutProject(markupService)
  }
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
                <Nav.Link
                  key={tab.id}
                  className={`about-nav__item ${
                    selectedTab === tab.id ? 'active' : ''
                  }`}
                  onClick={() => handleSelect(tab.id as TabId)}
                >
                  <span className="about-nav__icon">{tab.icon}</span>
                  <span className="about-nav__title">{tab.title}</span>
                </Nav.Link>
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
