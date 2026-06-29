import React from 'react'
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
import RealiaSearchPage from 'realia/ui/RealiaSearchPage'
import WordService from 'dictionary/application/WordService'
import BibliographyService from 'bibliography/application/BibliographyService'
import AfoRegisterService from 'afo-register/application/AfoRegisterService'
import RealiaService from 'realia/application/RealiaService'
import FragmentService from 'fragmentarium/application/FragmentService'
import DossiersService from 'dossiers/application/DossiersService'
import DossiersSearchPage from 'dossiers/ui/DossiersSearchPage'
import GenresPage from 'fragmentarium/ui/GenresPage'
import {
  ContentHistory,
  ContentLocation,
  ContentMatch,
  TabId,
} from 'router/toolsConfig'

export function ToolsIntroduction(): JSX.Element {
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

export function getContent({
  activeTab,
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
  match,
}: {
  activeTab?: TabId
  markupService: MarkupService
  signService: SignService
  wordService: WordService
  bibliographyService: BibliographyService
  afoRegisterService: AfoRegisterService
  realiaService: RealiaService
  dossiersService: DossiersService
  fragmentService: FragmentService
  history: ContentHistory
  location: ContentLocation
  match: ContentMatch
}): React.ReactElement {
  const routeProps = { location, match, history }

  const contentByTab: Partial<Record<TabId, React.ReactElement>> = {
    signs: <Signs {...routeProps} signService={signService} />,
    dictionary: <Dictionary wordService={wordService} {...routeProps} />,
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
    realia: <RealiaSearchPage realiaService={realiaService} />,
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
