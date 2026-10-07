import React from 'react'
import { expectRedirectToTarget } from 'router/notFoundRoutes.testSupport'
import { getServices } from 'test-support/AppDriver'
import AboutRoutes from 'router/aboutRoutes'
import { newsletters } from 'about/ui/news'

jest.mock('router/head', () => ({
  __esModule: true,
  HeadTagsService: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}))

const latestNewsletterPath = `/about/news/${newsletters[0].number}`

describe('AboutRoutes redirects', () => {
  test.each([
    ['/about', '/about/library'],
    ['/news', latestNewsletterPath],
    ['/about/news', latestNewsletterPath],
    ['/about/dictionary', '/about/akkadian-dictionary'],
  ])('redirects %p to %p', (initialEntry, targetPath) => {
    expectRedirectToTarget({
      initialEntry,
      targetPath,
      routes: [...AboutRoutes({ ...getServices(), sitemap: false })],
      routesFirst: false,
    })
  })
})
