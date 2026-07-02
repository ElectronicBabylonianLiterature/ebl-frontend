import React, { useContext, useEffect, useState } from 'react'
import { Container, Row, Col, Nav } from 'react-bootstrap'
import { Link, useLocation } from 'react-router-dom'
import SessionContext from 'auth/SessionContext'
import AppContent from 'common/ui/AppContent'
import './tools.sass'
import MarkupService from 'markup/application/MarkupService'
import SignService from 'signs/application/SignService'
import WordService from 'dictionary/application/WordService'
import BibliographyService from 'bibliography/application/BibliographyService'
import AfoRegisterService from 'afo-register/application/AfoRegisterService'
import RealiaService from 'realia/application/RealiaService'
import FragmentService from 'fragmentarium/application/FragmentService'
import DossiersService from 'dossiers/application/DossiersService'
import { useHistory } from 'router/compat'
import useScrollToHash from 'common/hooks/useScrollToHash'
import {
  TabId,
  tabConfig,
  getCurrentTab,
  getDisplayTitle,
  getToolsBreadcrumbs,
  isTabVisible,
} from 'router/toolsConfig'
import { getContent } from 'router/toolsContent'

export {
  tabIds,
  getCurrentTab,
  getDisplayTitle,
  getToolsBreadcrumbs,
} from 'router/toolsConfig'
export type { TabId } from 'router/toolsConfig'

export default function Tools({
  markupService,
  signService,
  wordService,
  bibliographyService,
  afoRegisterService,
  realiaService,
  dossiersService,
  fragmentService,
  activeTab,
}: {
  markupService: MarkupService
  signService: SignService
  wordService: WordService
  bibliographyService: BibliographyService
  afoRegisterService: AfoRegisterService
  realiaService: RealiaService
  dossiersService: DossiersService
  fragmentService: FragmentService
  activeTab?: TabId
}): JSX.Element {
  const session = useContext(SessionContext)
  const history = useHistory()
  const location = useLocation()
  const [selectedTab, setSelectedTab] = useState(activeTab)

  const handleSelect = (newTab: TabId) => {
    if (newTab === selectedTab) {
      return
    }

    setSelectedTab(newTab)
  }

  useEffect(() => {
    setSelectedTab(activeTab)
  }, [activeTab])

  useScrollToHash(location.hash)

  const currentTab = getCurrentTab(selectedTab)
  const displayTitle = getDisplayTitle(selectedTab)

  return (
    <AppContent
      crumbs={getToolsBreadcrumbs(displayTitle, selectedTab)}
      title="Tools"
    >
      <Container className="tools-container">
        <Row>
          <Col xs={12} md={3} className="tools-sidebar">
            <Nav className="flex-column tools-nav">
              {tabConfig
                .filter((tab) => isTabVisible(tab.id, session))
                .map((tab) => (
                  <Nav.Link
                    key={tab.id}
                    as={Link}
                    to={`/tools/${tab.id}`}
                    className={`tools-nav__item ${
                      selectedTab === tab.id ? 'active' : ''
                    }`}
                    onClick={() => handleSelect(tab.id as TabId)}
                  >
                    <span className="tools-nav__icon" aria-hidden="true">
                      {tab.icon}
                    </span>
                    <span className="tools-nav__title">{tab.title}</span>
                  </Nav.Link>
                ))}
            </Nav>
          </Col>

          <Col xs={12} md={9} className="tools-content">
            {selectedTab && currentTab && (
              <div className="tools-content__header">
                <span className="tools-content__icon" aria-hidden="true">
                  {currentTab.icon}
                </span>
                <h2 className="tools-content__title">{currentTab.title}</h2>
              </div>
            )}
            <div className="tools-content__body">
              {getContent({
                activeTab: selectedTab,
                markupService,
                signService,
                wordService,
                bibliographyService,
                afoRegisterService,
                realiaService,
                dossiersService,
                fragmentService,
                history,
                location,
                match: { params: {}, isExact: true, path: '', url: '' },
              })}
            </div>
          </Col>
        </Row>
      </Container>
    </AppContent>
  )
}
