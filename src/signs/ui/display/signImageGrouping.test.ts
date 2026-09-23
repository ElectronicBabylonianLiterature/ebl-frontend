import {
  sortVariants,
  sortGroupsByClusterRank,
  formatFormLabel,
} from 'signs/ui/display/signImageGrouping'
import { CroppedAnnotation } from 'signs/domain/CroppedAnnotation'

function croppedAnnotation(
  properties: Record<string, unknown>,
): CroppedAnnotation {
  return {
    fragmentNumber: 'K.1',
    image: 'image',
    script: { period: { name: 'Ur III' } },
    label: 'label',
    ...properties,
  } as unknown as CroppedAnnotation
}

describe('sortVariants', () => {
  test('Puts dated annotations before undated ones', () => {
    const dated = croppedAnnotation({ fragmentNumber: 'K.2', date: '1900' })
    const undated = croppedAnnotation({ fragmentNumber: 'K.1' })

    expect(sortVariants([undated, dated])).toEqual([dated, undated])
  })

  test('Orders annotations sharing a date state by fragment number', () => {
    const second = croppedAnnotation({ fragmentNumber: 'K.2', date: '1900' })
    const first = croppedAnnotation({ fragmentNumber: 'K.1', date: '1900' })

    expect(sortVariants([second, first])).toEqual([first, second])
  })
})

describe('sortGroupsByClusterRank', () => {
  const clustered = (clusterId: string, clusterRank: number) =>
    croppedAnnotation({ pcaClustering: { clusterId, clusterRank } })

  test('Groups by cluster id and orders by cluster rank', () => {
    const second = clustered('b', 2)
    const first = clustered('a', 1)

    expect(
      sortGroupsByClusterRank([second, first]).map(([clusterId]) => clusterId),
    ).toEqual(['a', 'b'])
  })

  test('Puts unclustered annotations last under a "no-cluster" key', () => {
    const unclustered = croppedAnnotation({})
    const first = clustered('a', 1)

    expect(
      sortGroupsByClusterRank([unclustered, first]).map(
        ([clusterId]) => clusterId,
      ),
    ).toEqual(['a', 'no-cluster'])
  })

  test('Ranks a group without a cluster rank last among clustered groups', () => {
    const ranked = clustered('a', 1)
    const unranked = croppedAnnotation({ pcaClustering: { clusterId: 'b' } })

    expect(
      sortGroupsByClusterRank([unranked, ranked]).map(
        ([clusterId]) => clusterId,
      ),
    ).toEqual(['a', 'b'])
  })
})

describe('formatFormLabel', () => {
  test.each([
    ['canonical', 'Canonical'],
    ['canonical2', 'Canonical 2'],
    ['variant', 'Variant'],
    ['variant3', 'Variant 3'],
    ['other', 'other'],
  ])('Formats %s as %s', (form, expected) => {
    expect(formatFormLabel(form)).toEqual(expected)
  })
})
