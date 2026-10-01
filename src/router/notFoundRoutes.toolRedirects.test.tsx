import React from 'react'
import {
  expectRedirectToTarget,
  expectRedirectWithLocationPreserved,
} from 'router/notFoundRoutes.testSupport'
import { getServices } from 'test-support/AppDriver'
import BibliographyRoutes from 'router/bibliographyRoutes'
import DictionaryRoutes from 'router/dictionaryRoutes'
import SignRoutes from 'router/signRoutes'
import ToolsRoutes from 'router/toolsRoutes'

jest.mock('router/head', () => ({
  __esModule: true,
  HeadTagsService: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}))

type RouteGroup = () => JSX.Element[]

const bibliographyRoutes: RouteGroup = () => [
  ...BibliographyRoutes({ ...getServices(), sitemap: false }),
]
const dictionaryRoutes: RouteGroup = () => [
  ...DictionaryRoutes({ ...getServices(), sitemap: false }),
]
const signRoutes: RouteGroup = () => [
  ...SignRoutes({ ...getServices(), sitemap: false }),
]
const toolsRoutes: RouteGroup = () => [
  ...ToolsRoutes({ ...getServices(), sitemap: false }),
]

describe.each([
  [
    'BibliographyRoutes',
    bibliographyRoutes,
    false,
    [['/bibliography', '/tools/references']],
  ],
  [
    'DictionaryRoutes',
    dictionaryRoutes,
    true,
    [
      ['/dictionary', '/tools/dictionary'],
      ['/dictionary/Dictionary.12345', '/tools/dictionary/:id'],
      ['/dictionary/Dictionary.12345/edit', '/tools/dictionary/:id/edit'],
    ],
  ],
  [
    'SignRoutes',
    signRoutes,
    true,
    [
      ['/signs', '/tools/signs'],
      ['/signs/Signs.12345', '/tools/signs/:id'],
    ],
  ],
  ['ToolsRoutes', toolsRoutes, false, [['/tools', '/tools/introduction']]],
])('%s redirects', (_name, routes, routesFirst, redirects) => {
  test.each(redirects)('redirects %p to %p', (initialEntry, targetPath) => {
    expectRedirectToTarget({
      initialEntry,
      targetPath,
      routes: routes(),
      routesFirst,
    })
  })
})

describe.each([
  [
    'BibliographyRoutes',
    bibliographyRoutes,
    [
      [
        '/bibliography/afo-register?text=EN&textNumber=1#results',
        '/tools/afo-register',
        '/tools/afo-register?text=EN&textNumber=1#results',
      ],
      [
        '/bibliography/references/new-reference?mode=quick#create',
        '/tools/references/new-reference',
        '/tools/references/new-reference?mode=quick#create',
      ],
      [
        '/bibliography/references/Reference.123?tab=meta#entry',
        '/tools/references/:id',
        '/tools/references/Reference.123?tab=meta#entry',
      ],
      [
        '/bibliography/references/Reference.123/edit?tab=history#editor',
        '/tools/references/:id/edit',
        '/tools/references/Reference.123/edit?tab=history#editor',
      ],
    ],
  ],
  [
    'DictionaryRoutes',
    dictionaryRoutes,
    [
      [
        '/dictionary/Dictionary.12345?tab=forms#entry',
        '/tools/dictionary/:id',
        '/tools/dictionary/Dictionary.12345?tab=forms#entry',
      ],
    ],
  ],
  [
    'SignRoutes',
    signRoutes,
    [
      [
        '/signs/Signs.12345?view=variants#glyph',
        '/tools/signs/:id',
        '/tools/signs/Signs.12345?view=variants#glyph',
      ],
    ],
  ],
])('%s redirects', (_name, routes, redirects) => {
  test.each(redirects)(
    'preserves query and hash for %p',
    (initialEntry, targetPath, expectedLocation) => {
      expectRedirectWithLocationPreserved({
        initialEntry,
        targetPath,
        expectedLocation,
        routes: routes(),
      })
    },
  )
})
