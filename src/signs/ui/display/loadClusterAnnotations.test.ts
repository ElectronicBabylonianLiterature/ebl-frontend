import SignService from 'signs/application/SignService'
import { CroppedAnnotation } from 'signs/domain/CroppedAnnotation'
import loadClusterAnnotations from 'signs/ui/display/loadClusterAnnotations'

jest.mock('signs/application/SignService')

const MockSignService = SignService as jest.Mock<jest.Mocked<SignService>>

const signName = 'BA'
const scriptAbbr = 'NA'

let signService: jest.Mocked<SignService>

function annotation(
  fragmentNumber: string,
  clusterId?: string,
): CroppedAnnotation {
  return {
    fragmentNumber,
    ...(clusterId ? { pcaClustering: { clusterId, clusterRank: 1 } } : {}),
  } as unknown as CroppedAnnotation
}

function load(croppedAnnotations: CroppedAnnotation[]) {
  return loadClusterAnnotations({
    croppedAnnotations,
    signService,
    signName,
    scriptAbbr,
  })
}

beforeEach(() => {
  signService = new MockSignService()
})

test('Answers the given annotations when none of them is clustered', async () => {
  const croppedAnnotations = [annotation('K.1'), annotation('K.2')]

  await expect(load(croppedAnnotations)).resolves.toEqual({
    annotations: croppedAnnotations,
    hasFailures: false,
  })
  expect(signService.getClusterVariants).not.toHaveBeenCalled()
})

test('Answers the cluster variants for each cluster', async () => {
  const variant = annotation('K.9', 'a')
  signService.getClusterVariants.mockResolvedValue([variant])

  await expect(load([annotation('K.1', 'a')])).resolves.toEqual({
    annotations: [variant],
    hasFailures: false,
  })
  expect(signService.getClusterVariants).toHaveBeenCalledWith(
    signName,
    'a',
    scriptAbbr,
  )
})

test('Falls back to the original annotations of a failed cluster', async () => {
  const clustered = annotation('K.1', 'a')
  signService.getClusterVariants.mockRejectedValue(new Error('failed'))

  await expect(load([clustered])).resolves.toEqual({
    annotations: [clustered],
    hasFailures: true,
  })
})

test('Treats an empty cluster response as a failure', async () => {
  const clustered = annotation('K.1', 'a')
  signService.getClusterVariants.mockResolvedValue([])

  await expect(load([clustered])).resolves.toEqual({
    annotations: [clustered],
    hasFailures: true,
  })
})

test('Keeps unclustered annotations alongside the cluster variants', async () => {
  const variant = annotation('K.9', 'a')
  const unclustered = annotation('K.2')
  signService.getClusterVariants.mockResolvedValue([variant])

  await expect(load([annotation('K.1', 'a'), unclustered])).resolves.toEqual({
    annotations: [variant, unclustered],
    hasFailures: false,
  })
})
