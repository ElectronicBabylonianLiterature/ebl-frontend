import React, { ReactNode, useState } from 'react'
import {
  Redirect,
  Route,
  RouteComponentProps,
  useHistory,
} from 'react-router-dom'
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
import CuneiformConverterForm from 'chronology/ui/CuneiformConverter/CuneiformConverterForm'
import SignService from 'signs/application/SignService'

const tabIds = [
  'date-converter',
  'list-of-kings',
  'cuneiform-converter',
] as const
type TabId = typeof tabIds[number]

const Tools = ({
  markupService,
  signService,
  activeTab,
}: {
  markupService: MarkupService
  signService: SignService
  activeTab: TabId
}): JSX.Element => {
  const history = useHistory()
  const [selectedTab, setSelectedTab] = useState(activeTab)
  const handleSelect = (selectedTab: TabId) => {
    history.push(selectedTab)
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
      </Tabs>
    </AppContent>
  )
}

export default function ToolsRoutes({
  sitemap,
  signService,
  markupService,
}: {
  sitemap: boolean
  signService: SignService
  markupService: MarkupService
}): JSX.Element[] {
  return [
    <Route
      key="tools-tabs"
      path={`/tools/:id(${tabIds.join('|')})`}
      exact
      render={(props: RouteComponentProps<{ id: string }>): ReactNode => (
        <HeadTagsService
          title="Tools: eBL"
          description="This section contains the electronic Babylonian Library (eBL) tools."
        >
          <Tools
            markupService={markupService}
            signService={signService}
            activeTab={props.match.params.id as TabId}
          />
        </HeadTagsService>
      )}
      {...(sitemap && sitemapDefaults)}
    />,
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
