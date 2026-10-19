import {
  sortVariants,
  sortGroupsByClusterRank,
  formatFormLabel,
} from 'signs/ui/display/signImageGrouping'
import { CroppedAnnotation } from 'signs/domain/CroppedAnnotation'
import {
  croppedAnnotationFactory,
  pcaClusteringFactory,
} from 'test-support/cropped-annotation-fixtures'
import { mesopotamianDateFactory } from 'test-support/date-fixtures'

function croppedAnnotation(
  properties: Partial<CroppedAnnotation>,
): CroppedAnnotation {
  return croppedAnnotationFactory.build({
    fragmentNumber: 'K.1',
    ...properties,
  })
}

const date = mesopotamianDateFactory.build()

describe('sortVariants', () => {
  test('Puts dated annotations before undated ones', () => {
    const dated = croppedAnnotation({ fragmentNumber: 'K.2', date })
    const undated = croppedAnnotation({ fragmentNumber: 'K.1' })

    expect(sortVariants([undated, dated])).toEqual([dated, undated])
  })

  test('Orders annotations sharing a date state by fragment number', () => {
    const second = croppedAnnotation({ fragmentNumber: 'K.2', date })
    const first = croppedAnnotation({ fragmentNumber: 'K.1', date })

    expect(sortVariants([second, first])).toEqual([first, second])
  })
})

describe('sortGroupsByClusterRank', () => {
  const clustered = (clusterId: string, clusterRank: number) =>
    croppedAnnotation({
      pcaClustering: pcaClusteringFactory.build({ clusterId, clusterRank }),
    })

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
    const clustering = pcaClusteringFactory.build({ clusterId: 'b' })
    Reflect.deleteProperty(clustering, 'clusterRank')
    const unranked = croppedAnnotation({ pcaClustering: clustering })

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
