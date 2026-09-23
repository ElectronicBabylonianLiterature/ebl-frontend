import { getEntityRoutes } from 'router/toolsRoutes.entities'
import {
  sitemapDefaults,
  type RealiaSlugs,
  type SignSlugs,
} from 'router/sitemapConfig'
import SignService from 'signs/application/SignService'
import WordService from 'dictionary/application/WordService'
import TextService from 'corpus/application/TextService'
import BibliographyService from 'bibliography/application/BibliographyService'
import RealiaService from 'realia/application/RealiaService'
import FragmentService from 'fragmentarium/application/FragmentService'

jest.mock('signs/application/SignService')
jest.mock('dictionary/application/WordService')
jest.mock('corpus/application/TextService')
jest.mock('bibliography/application/BibliographyService')
jest.mock('realia/application/RealiaService')
jest.mock('fragmentarium/application/FragmentService')

const realiaSlugs: RealiaSlugs = [{ id: 'Pig' }, { id: 'Enlil%2C%20Ellil' }]
const signSlugs: SignSlugs = [{ id: 'a2' }]

function getRoutes(sitemap: boolean): JSX.Element[] {
  return getEntityRoutes({
    sitemap,
    signService: new (SignService as jest.Mock<jest.Mocked<SignService>>)(),
    wordService: new (WordService as jest.Mock<jest.Mocked<WordService>>)(),
    textService: new (TextService as jest.Mock<jest.Mocked<TextService>>)(),
    bibliographyService: new (BibliographyService as jest.Mock<
      jest.Mocked<BibliographyService>
    >)(),
    realiaService: new (RealiaService as jest.Mock<
      jest.Mocked<RealiaService>
    >)(),
    fragmentService: new (FragmentService as jest.Mock<
      jest.Mocked<FragmentService>
    >)(),
    signSlugs,
    realiaSlugs,
  })
}

function getRouteByPath(routes: JSX.Element[], path: string): JSX.Element {
  const route = routes.find((route) => route.props.path === path)

  expect(route).toBeDefined()

  return route as JSX.Element
}

it('passes the Realia slugs to the Realia entry route when sitemap is enabled', () => {
  const realiaRoute = getRouteByPath(getRoutes(true), '/tools/realia/:id')

  expect(realiaRoute.props).toMatchObject({
    ...sitemapDefaults,
    slugs: realiaSlugs,
  })
})

it('does not pass Realia slugs to the Realia entry route outside the sitemap', () => {
  const realiaRoute = getRouteByPath(getRoutes(false), '/tools/realia/:id')

  expect(realiaRoute.props).not.toHaveProperty('slugs')
  expect(realiaRoute.props).not.toHaveProperty('sitemapIndex')
})

it('does not pass the Realia slugs to other entity routes', () => {
  const signRoute = getRouteByPath(getRoutes(true), '/tools/signs/:id')

  expect(signRoute.props.slugs).toEqual(signSlugs)
})

it('decodes an encoded Realia slug back to the entry id when rendering the route', () => {
  const realiaRoute = getRouteByPath(getRoutes(true), '/tools/realia/:id')
  const rendered = realiaRoute.props.render({
    match: { params: { id: 'Enlil%2C%20Ellil' } },
  }) as JSX.Element

  expect(rendered.props.title).toContain('Enlil, Ellil')
  expect(rendered.props.children.props.id).toEqual('Enlil, Ellil')
})
