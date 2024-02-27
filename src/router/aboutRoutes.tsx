import React, { ReactNode } from 'react'
import { Redirect, Route, RouteComponentProps } from 'react-router-dom'
import About, { TabId, tabIds } from 'about/ui/about'
import { CachedMarkupService } from 'markup/application/MarkupService'
import { sitemapDefaults } from 'router/sitemap'
import { HeadTagsService } from 'router/head'
import NotFoundPage from 'NotFoundPage'
import { newsletters } from 'about/ui/news'

// ToDo:
// - Test change of url on click at about
// - Update sitemap

export default function AboutRoutes({
  sitemap,
  cachedMarkupService,
}: {
  sitemap: boolean
  cachedMarkupService: CachedMarkupService
}): JSX.Element[] {
  return [
    <Redirect
      exact
      from="/about/news"
      to={`/about/news/${newsletters[0].number}`}
      key="about-news-root-redirect"
    />,
    <Route
      key="about-tabs"
      exact
      path={`/about/:id(${tabIds.join('|')})/:id2?`}
      render={(
        props: RouteComponentProps<{ id: string; id2?: string }>
      ): ReactNode => (
        <HeadTagsService
          title="About: eBL"
          description="This section provides detailed information about the electronic Babylonian Library (eBL) and the materials and tools available."
        >
          <About
            markupService={cachedMarkupService}
            activeTab={props.match.params.id as TabId}
            activeSection={props.match.params?.id2 as string}
          />
        </HeadTagsService>
      )}
      {...(sitemap && sitemapDefaults)}
    />,
    <Route
      key="about-not-found"
      path="/about/*"
      render={(): ReactNode => <NotFoundPage />}
    />,
    <Redirect
      from="/about"
      to="/about/fragmentarium"
      key="about-root-redirect"
    />,
  ]
}
