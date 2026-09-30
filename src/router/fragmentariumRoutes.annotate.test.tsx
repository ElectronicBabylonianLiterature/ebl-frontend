import TagSignsView from 'fragmentarium/ui/image-annotation/TagSignsView'
import FragmentariumRoutes from 'router/fragmentariumRoutes'
import { getServices } from 'test-support/AppDriver'

it('decodes the fragment number and wires services into the annotate route', () => {
  const services = getServices()
  const annotateRoute = FragmentariumRoutes({
    ...services,
    sitemap: false,
  }).find((route) => route.props.path === '/library/:id/annotate')

  expect(annotateRoute).toBeDefined()

  const rendered = annotateRoute?.props.render({
    match: { params: { id: 'BM%2E42' } },
  }) as JSX.Element

  expect(rendered.type).toBe(TagSignsView)
  expect(rendered.props).toMatchObject({
    fragmentService: services.fragmentService,
    signService: services.signService,
    number: 'BM.42',
  })
})
