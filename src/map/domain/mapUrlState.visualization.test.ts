import { parseMapUrlState } from 'map/domain/mapUrlState'

it('parses a supported visualization and defaults an invalid one', () => {
  expect(parseMapUrlState('mv=1&areas=1&viz=evidence').visualization).toBe(
    'evidence',
  )
  expect(parseMapUrlState('mv=1&viz=unknown').visualization).toBe('mapped')
})
