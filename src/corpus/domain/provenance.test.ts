import {
  compareAssyriaAndBabylonia,
  compareCity,
  compareStandardText,
  Provenance,
  provenances,
  Provenances,
} from './provenance'

const cities = Object.values(Provenances).filter(
  (provenance) =>
    !([
      Provenances['Standard Text'],
      Provenances.Assyria,
      Provenances.Babylonia,
    ] as Provenance[]).includes(provenance)
)

test.each(Object.values(Provenances))('%s is in periods', (provenance) => {
  expect(provenances).toContain(provenance)
})

describe('compareStandardText', () => {
  test.each([...provenances.values()])(
    'compareStandardText same type %s',
    (provenance) => {
      expect(compareStandardText(provenance, provenance)).toEqual(0)
    }
  )

  const realProvenances = Object.values(Provenances).filter(
    (provenance) => provenance !== Provenances['Standard Text']
  )

  test.each(realProvenances)('Standard Text and %s', (provenance) => {
    expect(
      compareStandardText(Provenances['Standard Text'], provenance)
    ).toEqual(-1)
    expect(
      compareStandardText(provenance, Provenances['Standard Text'])
    ).toEqual(1)
  })

  test.each(
    realProvenances.flatMap((first, index) =>
      realProvenances.slice(index + 1).map((second) => [first, second])
    )
  )('%s and %s', (first, second) => {
    expect(compareStandardText(first, second)).toEqual(0)
    expect(compareStandardText(second, first)).toEqual(0)
  })
})

describe('compareAssyriaAndBabylonia', () => {
  test.each([...provenances.values()])('same type %s', (provenance) => {
    expect(compareAssyriaAndBabylonia(provenance, provenance)).toEqual(0)
  })

  test.each(cities)('compareStandardText Assyria and %s', (provenance) => {
    expect(compareAssyriaAndBabylonia(Provenances.Assyria, provenance)).toEqual(
      -1
    )
    expect(compareAssyriaAndBabylonia(provenance, Provenances.Assyria)).toEqual(
      1
    )
  })

  test.each(cities)('compareStandardText Babylonia and %s', (provenance) => {
    expect(
      compareAssyriaAndBabylonia(Provenances.Babylonia, provenance)
    ).toEqual(-1)
    expect(
      compareAssyriaAndBabylonia(provenance, Provenances.Babylonia)
    ).toEqual(1)
  })

  test.each(
    cities.flatMap((first, index) =>
      cities.slice(index + 1).map((second) => [first, second])
    )
  )('compareStandardText %s and %s', (first, second) => {
    expect(compareAssyriaAndBabylonia(first, second)).toEqual(0)
    expect(compareAssyriaAndBabylonia(second, first)).toEqual(0)
  })
})

describe('compareCity', () => {
  test.each([
    [Provenances.Babylon, Provenances.Babylon, 0],
    [Provenances.Babylon, Provenances.Cutha, -1],
    [Provenances.Cutha, Provenances.Babylon, 1],
    [Provenances.Mari, Provenances.Larsa, 1],
    [Provenances.Larsa, Provenances.Mari, -1],
  ])('compareStandardText %s and %s', (first, second, expected) => {
    expect(compareCity(first, second)).toEqual(expected)
  })
})
