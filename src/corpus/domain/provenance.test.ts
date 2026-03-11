import {
  compareAssyriaAndBabylonia,
  compareName,
  compareStandardText,
  Provenance,
  provenances,
  Provenances,
  setProvenanceRecords,
} from './provenance'
import { testContainsAllValues } from 'test-support/test-values-complete'

setProvenanceRecords([
  {
    id: 'standard-text',
    longName: 'Standard Text',
    abbreviation: 'ST',
    parent: null,
    sortKey: 1,
  },
  {
    id: 'assyria',
    longName: 'Assyria',
    abbreviation: 'Ass',
    parent: null,
    sortKey: 2,
  },
  {
    id: 'babylonia',
    longName: 'Babylonia',
    abbreviation: 'Bab',
    parent: null,
    sortKey: 3,
  },
  {
    id: 'babylon',
    longName: 'Babylon',
    abbreviation: 'Bbl',
    parent: 'Babylonia',
    sortKey: 4,
  },
  {
    id: 'cutha',
    longName: 'Cutha',
    abbreviation: 'Cut',
    parent: 'Babylonia',
    sortKey: 5,
  },
  {
    id: 'larsa',
    longName: 'Larsa',
    abbreviation: 'Lar',
    parent: 'Babylonia',
    sortKey: 6,
  },
  {
    id: 'mari',
    longName: 'Mari',
    abbreviation: 'Mar',
    parent: 'Babylonia',
    sortKey: 7,
  },
])

const cities = Object.values(Provenances).filter(
  (provenance) =>
    !(
      [
        Provenances['Standard Text'],
        Provenances.Assyria,
        Provenances.Babylonia,
      ] as Provenance[]
    ).includes(provenance),
)

testContainsAllValues(Provenances, provenances, 'provenances')

function makePairs<T>(values: T[]): [T, T][] {
  return values.flatMap((first, index) =>
    values.slice(index + 1).map((second): [T, T] => [first, second]),
  )
}

describe('compareStandardText', () => {
  test.each([...provenances.values()])(
    'compareStandardText same type %s',
    (provenance) => {
      expect(compareStandardText(provenance, provenance)).toEqual(0)
    },
  )

  const realProvenances = Object.values(Provenances).filter(
    (provenance) => provenance !== Provenances['Standard Text'],
  )

  test.each(realProvenances)('Standard Text and %s', (provenance) => {
    expect(
      compareStandardText(Provenances['Standard Text'], provenance),
    ).toEqual(-1)
    expect(
      compareStandardText(provenance, Provenances['Standard Text']),
    ).toEqual(1)
  })

  test.each(makePairs(realProvenances))('%s and %s', (first, second) => {
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
      compareAssyriaAndBabylonia(Provenances.Assyria, Provenances.Babylonia),
    ).toEqual(-1)
    expect(
      compareAssyriaAndBabylonia(Provenances.Babylonia, Provenances.Assyria),
    ).toEqual(1)
  })

  test.each(cities)(
    'compareAssyriaAndBabylonia Assyria and %s',
    (provenance) => {
      expect(
        compareAssyriaAndBabylonia(Provenances.Assyria, provenance),
      ).toEqual(-1)
      expect(
        compareAssyriaAndBabylonia(provenance, Provenances.Assyria),
      ).toEqual(1)
    },
  )

  test.each(cities)(
    'compareAssyriaAndBabylonia Babylonia and %s',
    (provenance) => {
      expect(
        compareAssyriaAndBabylonia(Provenances.Babylonia, provenance),
      ).toEqual(-1)
      expect(
        compareAssyriaAndBabylonia(provenance, Provenances.Babylonia),
      ).toEqual(1)
    },
  )

  test.each(makePairs(cities))(
    'compareAssyriaAndBabylonia %s and %s',
    (first, second) => {
      expect(compareAssyriaAndBabylonia(first, second)).toEqual(0)
      expect(compareAssyriaAndBabylonia(second, first)).toEqual(0)
    },
  )
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
