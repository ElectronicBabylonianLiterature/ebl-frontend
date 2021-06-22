import { compareStandardText, provenances, Provenances } from './provenance'

test.each(Object.values(Provenances))('%s is in periods', (provenance) => {
  expect(provenances).toContain(provenance)
})

test.each([...provenances.values()])(
  'compareStandardText same type %s',
  (provenance) => {
    expect(compareStandardText(provenance, provenance)).toEqual(0)
  }
)

const realProvenances = Object.values(Provenances).filter(
  (provenance) => provenance !== Provenances['Standard Text']
)

test.each(realProvenances)(
  'compareStandardText Standard Text and %s',
  (provenance) => {
    expect(
      compareStandardText(Provenances['Standard Text'], provenance)
    ).toEqual(-1)
    expect(
      compareStandardText(provenance, Provenances['Standard Text'])
    ).toEqual(1)
  }
)

test.each(
  realProvenances
    .filter((provenance) => provenance !== Provenances['Standard Text'])
    .flatMap((first, index) =>
      realProvenances.slice(index + 1).map((second) => [first, second])
    )
)('compareStandardText %s and %s', (first, second) => {
  expect(compareStandardText(first, second)).toEqual(0)
  expect(compareStandardText(second, first)).toEqual(0)
})
