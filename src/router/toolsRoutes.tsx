import React, { ReactNode, useState } from 'react'
import { Redirect, Route, useHistory } from 'react-router-dom'
import MarkupService from 'markup/application/MarkupService'
import { sitemapDefaults } from 'router/sitemap'
import { HeadTagsService } from 'router/head'
import AppContent from 'common/AppContent'
import { TextCrumb } from 'common/Breadcrumbs'
import { Tab, Tabs } from 'react-bootstrap'
import DateConverterForm, {
  AboutDateConverter,
} from 'chronology/ui/DateConverter/DateConverterForm'
import ListOfKings from 'chronology/ui/Kings/BrinkmanKingsTable'
import _ from 'lodash'
import 'about/ui/about.sass'
import NotFoundPage from 'NotFoundPage'
import CuneiformConverterForm from 'signs/ui/CuneiformConverter/CuneiformConverterForm'
import SignService from 'signs/application/SignService'
import GenresList from 'fragmentarium/ui/genres/GenresList'
import FragmentService from 'fragmentarium/application/FragmentService'

const tabIds = [
  'date-converter',
  'list-of-kings',
  'cuneiform-converter',
  'genres',
] as const
type TabId = typeof tabIds[number]

const Tools = ({
  markupService,
  signService,
  fragmentService,
  activeTab,
}: {
  markupService: MarkupService
  signService: SignService
  fragmentService: FragmentService
  activeTab: TabId
}): JSX.Element => {
  const history = useHistory()
  const [selectedTab, setSelectedTab] = useState(activeTab)
  const handleSelect = (selectedTab: TabId) => {
    history.push(`/tools/${selectedTab}`)
    setSelectedTab(selectedTab)
  }
  return (
    <AppContent
      title="Tools"
      crumbs={[
        new TextCrumb('Tools'),
        new TextCrumb(_.capitalize(selectedTab).replaceAll('-', ' ')),
      ]}
    >
      <Tabs
        id="tools"
        defaultActiveKey={selectedTab}
        onSelect={(selectedTab) => handleSelect(selectedTab as TabId)}
        mountOnEnter
        unmountOnExit
      >
        <Tab eventKey="date-converter" title="Date converter">
          {AboutDateConverter(markupService)}
          <DateConverterForm />
        </Tab>
        <Tab eventKey="list-of-kings" title="List of kings">
          {ListOfKings()}
        </Tab>
        <Tab eventKey="cuneiform-converter" title="Cuneiform converter">
          <CuneiformConverterForm signService={signService} />
        </Tab>
        <Tab eventKey="genres" title="Genres">
          <GenresList fragmentService={fragmentService} />
        </Tab>
      </Tabs>
    </AppContent>
  )
}

export default function ToolsRoutes({
  sitemap,
  signService,
  markupService,
  fragmentService,
}: {
  sitemap: boolean
  signService: SignService
  markupService: MarkupService
  fragmentService: FragmentService
}): JSX.Element[] {
  return [
    ...tabIds.map((tabId) => (
      <Route
        key={`tools-${tabId}`}
        path={`/tools/${tabId}`}
        exact
        render={(): ReactNode => (
          <HeadTagsService
            title={`Tools: ${_.capitalize(tabId).replaceAll('-', ' ')} - eBL`}
            description="This section contains the electronic Babylonian Library (eBL) tools."
          >
            <Tools
              markupService={markupService}
              signService={signService}
              fragmentService={fragmentService}
              activeTab={tabId}
            />
          </HeadTagsService>
        )}
        {...(sitemap && sitemapDefaults)}
      />
    )),
    <Route
      key="ToolsNotFound"
      path="/tools/*"
      exact
      render={(): ReactNode => <NotFoundPage />}
    />,
    <Redirect
      from="/tools"
      to="/tools/date-converter"
      key="tools-root-redirect"
    />,
  ]
}
