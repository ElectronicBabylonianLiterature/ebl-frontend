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
} from 'chronology/ui/DateConverterForm'
import AboutListOfKings from 'chronology/ui/BrinkmanKingsTable'
import _ from 'lodash'
import 'about/ui/about.sass'
import NotFoundPage from 'NotFoundPage'

const tabIds = ['date-converter', 'list-of-kings'] as const
type TabId = typeof tabIds[number]

const Tools = ({
  markupService,
  activeTab,
}: {
  markupService: MarkupService
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
          {AboutListOfKings()}
        </Tab>
      </Tabs>
    </AppContent>
  )
}

export default function ToolsRoutes({
  sitemap,
  markupService,
}: {
  sitemap: boolean
  markupService: MarkupService
}): JSX.Element[] {
  return [
    <Route
      key="tools-tabs"
      exact
      path={`/tools/:id(${tabIds.join('|')})`}
      render={(props: RouteComponentProps<{ id: string }>): ReactNode => (
        <HeadTagsService
          title="Tools: eBL"
          description="This section contains the electronic Babylonian Library (eBL) tools."
        >
          <Tools
            markupService={markupService}
            activeTab={props.match.params.id as TabId}
          />
        </HeadTagsService>
      )}
      {...(sitemap && sitemapDefaults)}
    />,
    <Route
      key="tools-not-found"
      path="/tools/*"
      render={(): ReactNode => <NotFoundPage />}
    />,
    <Redirect
      from="/tools"
      to="/tools/date-converter"
      key="tools-root-redirect"
    />,
  ]
}
