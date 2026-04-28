import React, { useEffect, useState } from 'react'
import { Container, Row, Col, Nav } from 'react-bootstrap'
import { useLocation } from 'react-router-dom'
import { TextCrumb } from 'common/ui/Breadcrumbs'
import Breadcrumbs from 'common/ui/Breadcrumbs'
import './tools.sass'
import DateConverterForm, {
  AboutDateConverter,
} from 'chronology/ui/DateConverter/DateConverterForm'
import ListOfKings from 'chronology/ui/Kings/BrinkmanKingsTable'
import CuneiformConverterForm from 'signs/ui/CuneiformConverter/CuneiformConverterForm'
import MarkupService from 'markup/application/MarkupService'
import SignService from 'signs/application/SignService'
import Signs from 'signs/ui/search/Signs'
import Dictionary from 'dictionary/ui/search/Dictionary'
import BibliographyReferencesContent from 'bibliography/ui/BibliographyReferencesContent'
import AfoRegisterSearchPage from 'afo-register/ui/AfoRegisterSearchPage'
import WordService from 'dictionary/application/WordService'
import BibliographyService from 'bibliography/application/BibliographyService'
import AfoRegisterService from 'afo-register/application/AfoRegisterService'
import FragmentService from 'fragmentarium/application/FragmentService'
import DossiersService from 'dossiers/application/DossiersService'
import DossiersSearchPage from 'dossiers/ui/DossiersSearchPage'
import GenresPage from 'fragmentarium/ui/GenresPage'
import { useHistory } from 'router/compat'

export const tabIds = [
  'signs',
  'dictionary',
  'references',
  'afo-register',
  'dossiers',
  'genres',
  'date-converter',
  'list-of-kings',
  'cuneiform-converter',
] as const
export type TabId = (typeof tabIds)[number]

const tabConfig = [
  { id: 'signs', title: 'Signs', icon: '𒀀' },
  { id: 'dictionary', title: 'Akkadian Dictionary', icon: 'Ꞌ' },
  { id: 'references', title: 'References', icon: '※' },
  { id: 'afo-register', title: 'AfO-Register', icon: '⊞' },
  { id: 'dossiers', title: 'Dossiers', icon: '🗂️' },
  { id: 'genres', title: 'Genres', icon: '📚' },
  { id: 'date-converter', title: 'Date Converter', icon: '⇌' },
  { id: 'list-of-kings', title: 'List of Kings', icon: '♔' },
  { id: 'cuneiform-converter', title: 'Cuneiform Converter', icon: '𒐕' },
]

export function getCurrentTab(
  selectedTab?: TabId,
): (typeof tabConfig)[number] | undefined {
  return tabConfig.find((tab) => tab.id === selectedTab)
}

export function getDisplayTitle(selectedTab?: TabId): string {
  if (!selectedTab) {
    return 'Tools'
  }

  return getCurrentTab(selectedTab)?.title ?? 'Tools'
}

export function getToolsBreadcrumbs(
  displayTitle: string,
  selectedTab?: TabId,
): TextCrumb[] {
  if (!selectedTab) {
    return [new TextCrumb('Tools')]
  }

  return [new TextCrumb('Tools'), new TextCrumb(displayTitle)]
}

function ToolsIntroduction(): JSX.Element {
  return (
    <div className="tools-introduction">
      <h3>Welcome to eBL Tools</h3>
      <p>
        The electronic Babylonian Library (eBL) provides a comprehensive suite
        of research tools designed to support scholars, students, and
        enthusiasts in the study of ancient Mesopotamian texts and cuneiform
        studies.
      </p>
      <h4>Available Tools</h4>
      <p>
        Our collection includes specialized search interfaces for cuneiform
        signs and Akkadian vocabulary, as well as utilities for date conversion,
        historical reference, and script transliteration. Each tool has been
        carefully developed to integrate seamlessly with the broader eBL
        platform, providing reliable access to authoritative sources and
        comprehensive datasets.
      </p>
      <p>
        Select a tool from the sidebar to begin exploring the resources
        available for your research.
      </p>
    </div>
  )
}

function getContent({
  activeTab,
  markupService,
  signService,
  wordService,
  bibliographyService,
  afoRegisterService,
  dossiersService,
  fragmentService,
}: {
  activeTab?: TabId
  markupService: MarkupService
  signService: SignService
  wordService: WordService
  bibliographyService: BibliographyService
  afoRegisterService: AfoRegisterService
  dossiersService: DossiersService
  fragmentService: FragmentService
}): React.ReactElement {
  const contentByTab: Partial<Record<TabId, React.ReactElement>> = {
    signs: <Signs signService={signService} />,
    dictionary: <Dictionary wordService={wordService} />,
    references: (
      <BibliographyReferencesContent
        bibliographyService={bibliographyService}
      />
    ),
    'afo-register': (
      <AfoRegisterSearchPage
        afoRegisterService={afoRegisterService}
        fragmentService={fragmentService}
      />
    ),
    dossiers: <DossiersSearchPage dossiersService={dossiersService} />,
    genres: <GenresPage fragmentService={fragmentService} />,
    'date-converter': (
      <>
        {AboutDateConverter(markupService)}
        <DateConverterForm />
      </>
    ),
    'list-of-kings': ListOfKings(),
    'cuneiform-converter': <CuneiformConverterForm signService={signService} />,
  }

  return activeTab ? (
    (contentByTab[activeTab] ?? <ToolsIntroduction />)
  ) : (
    <ToolsIntroduction />
  )
}

export default function Tools({
  markupService,
  signService,
  wordService,
  bibliographyService,
  afoRegisterService,
  dossiersService,
  fragmentService,
  activeTab,
}: {
  markupService: MarkupService
  signService: SignService
  wordService: WordService
  bibliographyService: BibliographyService
  afoRegisterService: AfoRegisterService
  dossiersService: DossiersService
  fragmentService: FragmentService
  activeTab?: TabId
}): JSX.Element {
  const history = useHistory()
  const location = useLocation()
  const [selectedTab, setSelectedTab] = useState(activeTab)

  const handleSelect = (newTab: TabId) => {
    if (newTab === selectedTab) {
      return
    }
    history.push(`/tools/${newTab}`)
    setSelectedTab(newTab)
  }

  useEffect(() => {
    setSelectedTab(activeTab)
  }, [activeTab])

  useEffect(() => {
    const hash = location.hash
    if (hash) {
      const id = hash.replace('#', '')
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const element = document.getElementById(id)
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' })
          }
        })
      })
    }
  }, [location])

  const currentTab = getCurrentTab(selectedTab)
  const displayTitle = getDisplayTitle(selectedTab)

  return (
    <>
      <div className="tools-header">
        <Container>
          <Breadcrumbs
            className="tools-header__breadcrumbs"
            crumbs={getToolsBreadcrumbs(displayTitle, selectedTab)}
          />
        </Container>
      </div>
      <Container>
        <h1 className="tools-header__title">Tools</h1>
      </Container>

      <Container className="tools-container">
        <Row>
          <Col xs={12} md={3} className="tools-sidebar">
            <Nav className="flex-column tools-nav">
              {tabConfig.map((tab) => (
                <Nav.Link
                  key={tab.id}
                  className={`tools-nav__item ${
                    selectedTab === tab.id ? 'active' : ''
                  }`}
                  onClick={() => handleSelect(tab.id as TabId)}
                >
                  <span className="tools-nav__icon">{tab.icon}</span>
                  <span className="tools-nav__title">{tab.title}</span>
                </Nav.Link>
              ))}
            </Nav>
          </Col>

          <Col xs={12} md={9} className="tools-content">
            {selectedTab && currentTab && (
              <div className="tools-content__header">
                <span className="tools-content__icon">{currentTab.icon}</span>
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
                dossiersService,
                fragmentService,
              })}
            </div>
          </Col>
        </Row>
      </Container>
    </>
  )
}
