import {
  compareAssyriaAndBabylonia,
  compareName,
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

  test('compareAssyriaAndBabylonia Assyria and Babylonia', () => {
    expect(
      compareAssyriaAndBabylonia(Provenances.Assyria, Provenances.Babylonia)
    ).toEqual(-1)
    expect(
      compareAssyriaAndBabylonia(Provenances.Babylonia, Provenances.Assyria)
    ).toEqual(1)
  })

  test.each(cities)(
    'compareAssyriaAndBabylonia Assyria and %s',
    (provenance) => {
      expect(
        compareAssyriaAndBabylonia(Provenances.Assyria, provenance)
      ).toEqual(-1)
      expect(
        compareAssyriaAndBabylonia(provenance, Provenances.Assyria)
      ).toEqual(1)
    }
  )

  test.each(cities)(
    'compareAssyriaAndBabylonia Babylonia and %s',
    (provenance) => {
      expect(
        compareAssyriaAndBabylonia(Provenances.Babylonia, provenance)
      ).toEqual(-1)
      expect(
        compareAssyriaAndBabylonia(provenance, Provenances.Babylonia)
      ).toEqual(1)
    }
  )

  test.each(
    cities.flatMap((first, index) =>
      cities.slice(index + 1).map((second) => [first, second])
    )
  )('compareAssyriaAndBabylonia %s and %s', (first, second) => {
    expect(compareAssyriaAndBabylonia(first, second)).toEqual(0)
    expect(compareAssyriaAndBabylonia(second, first)).toEqual(0)
  })
})

describe('compareName', () => {
  test.each([
    [Provenances.Babylon, Provenances.Babylon, 0],
    [Provenances.Babylon, Provenances.Cutha, -1],
    [Provenances.Cutha, Provenances.Babylon, 1],
    [Provenances.Mari, Provenances.Larsa, 1],
    [Provenances.Larsa, Provenances.Mari, -1],
  ])('compareName %s and %s', (first, second, expected) => {
    expect(compareName(first, second)).toEqual(expected)
  })
})
