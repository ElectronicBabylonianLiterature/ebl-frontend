import React, { ReactNode } from 'react'
import { Redirect, Route } from 'react-router-dom'
import About, { tabIds } from 'about/ui/about'
import { CachedMarkupService } from 'markup/application/MarkupService'
import { sitemapDefaults } from 'router/sitemap'
import { HeadTagsService } from 'router/head'
import NotFoundPage from 'NotFoundPage'
import { newsletters } from 'about/ui/news'

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
    ...newsletters.map((newsletter) => (
      <Route
        key={`about-news-${newsletter.number}`}
        exact
        path={`/about/news/${newsletter.number}`}
        render={(): ReactNode => (
          <HeadTagsService
            title={`News: ${newsletter.number} - eBL`}
            description={
              'Latest news and updates about the electronic Babylonian Library (eBL).'
            }
          >
            <About
              markupService={cachedMarkupService}
              activeTab="news"
              activeSection={newsletter.number.toString()}
            />
          </HeadTagsService>
        )}
        {...(sitemap && sitemapDefaults)}
      />
    )),
    ...tabIds.map((tabId) => (
      <Route
        key={`about-${tabId}`}
        exact
        path={`/about/${tabId}`}
        render={(): ReactNode => (
          <HeadTagsService
            title="About: eBL"
            description="This section provides detailed information about the electronic Babylonian Library (eBL) and the materials and tools available."
          >
            <About
              markupService={cachedMarkupService}
              activeTab={tabId}
              activeSection={undefined}
            />
          </HeadTagsService>
        )}
        {...(sitemap && sitemapDefaults)}
      />
    )),
    <Route
      key="AboutNotFound"
      path="/about/*"
      render={(): ReactNode => <NotFoundPage />}
    />,
    <Redirect from="/about" to="/about/library" key="about-root-redirect" />,
  ]
}
