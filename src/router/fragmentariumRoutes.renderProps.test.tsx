import { ReactElement, ReactNode } from 'react'
import { Location } from 'history'
import FragmentariumRoutes from 'router/fragmentariumRoutes'
import { sitemapDefaults } from 'router/sitemapConfig'
import FragmentView from 'fragmentarium/ui/fragment/FragmentView'
import Fragmentarium from 'fragmentarium/ui/front-page/Fragmentarium'
import FragmentLineToVecRanking from 'fragmentarium/ui/line-to-vec/FragmentLineToVecRanking'
import RecordView from 'fragmentarium/ui/fragment/RecordView'
import TagSignsView from 'fragmentarium/ui/image-annotation/TagSignsView'
import NotFoundPage from 'NotFoundPage'
import MemorySession from 'auth/Session'
import { getServices } from 'test-support/AppDriver'

type RouteRenderProps = {
  match: { params: Record<string, string | undefined> }
  location: Location
}

const services = getServices()
const session = new MemorySession(['read:fragments'])
const fragmentSlugs = [{ id: 'K.1' }]

function findRoute(path: string, sitemap = false): ReactElement {
  const route = FragmentariumRoutes({
    ...services,
    sitemap,
    fragmentSlugs,
  }).find((candidate) => candidate.props.path === path)
  if (!route) {
    throw new Error(`No route for ${path}`)
  }
  return route
}

function createLocation(search = '', hash = ''): Location {
  return { pathname: '/library', search, hash, state: null, key: 'test' }
}

function elementForRoute(
  path: string,
  params: Record<string, string | undefined>,
  location: Location = createLocation(),
): ReactElement {
  const props: RouteRenderProps = { match: { params }, location }
  return findRoute(path).props.render(props) as ReactElement
}

function pageOf(element: ReactElement): ReactElement {
  return element.props.children as ReactElement
}

function fragmentViewFor(
  params: Record<string, string | undefined>,
  location: Location,
): ReactElement {
  const consumer = elementForRoute('/library/:id', params, location)
  const childrenForSession = consumer.props.children as (
    session: MemorySession,
  ) => ReactNode
  return pageOf(childrenForSession(session) as ReactElement)
}

describe('FragmentariumRoutes render props', () => {
  it.each([
    ['/library/:id/match', FragmentLineToVecRanking],
    ['/library/:id/record', RecordView],
  ])('decodes the fragment number for %s', (path, component) => {
    const page = pageOf(elementForRoute(path, { id: 'BM%2E42' }))

    expect(page.type).toBe(component)
    expect(page.props.number).toBe('BM.42')
  })

  it.each([
    ['/library/:id/match', true],
    ['/library/:id/annotate', false],
    ['/library/:id/record', true],
  ])('uses an empty number without an id for %s', (path, hasHead) => {
    const rendered = elementForRoute(path, {})
    const page = hasHead ? pageOf(rendered) : rendered

    expect(page.props.number).toBe('')
  })

  it('renders the annotate route without head tags', () => {
    expect(elementForRoute('/library/:id/annotate', { id: 'K.1' }).type).toBe(
      TagSignsView,
    )
  })

  it('parses single fragment parameters', () => {
    const page = fragmentViewFor(
      { id: 'K%2E1' },
      createLocation('?tab=folio&folioName=WGL&folioNumber=1', '#line%201'),
    )

    expect(page.type).toBe(FragmentView)
    expect(page.props).toMatchObject({
      number: 'K.1',
      folioName: 'WGL',
      folioNumber: '1',
      tab: 'folio',
      activeLine: 'line 1',
      session,
    })
  })

  it('joins repeated parameters and defaults missing ones', () => {
    const page = fragmentViewFor({}, createLocation('?tab=fol&tab=io'))

    expect(page.props).toMatchObject({
      number: '',
      tab: 'folio',
      folioName: undefined,
      folioNumber: undefined,
      activeLine: '',
    })
  })

  it('renders the library front page', () => {
    const page = pageOf(elementForRoute('/library', {}))

    expect(page.type).toBe(Fragmentarium)
    expect(page.props).toMatchObject({
      fragmentService: services.fragmentService,
      bibliographyService: services.bibliographyService,
    })
  })

  it('renders the not found page for unknown library paths', () => {
    expect(elementForRoute('/library/*', {}).type).toBe(NotFoundPage)
  })

  it('adds sitemap settings only when the sitemap is built', () => {
    expect(findRoute('/library', true).props).toMatchObject(sitemapDefaults)
    expect(findRoute('/library/:id', true).props).toMatchObject({
      ...sitemapDefaults,
      slugs: fragmentSlugs,
    })
    expect(findRoute('/library').props).not.toHaveProperty('sitemapIndex')
    expect(findRoute('/library/:id').props).not.toHaveProperty('slugs')
  })
})
