import { provenances, Provenances } from './provenance'

test.each(Object.values(Provenances))('%s is in periods', (provenance) => {
  expect(provenances).toContain(provenance)
})
