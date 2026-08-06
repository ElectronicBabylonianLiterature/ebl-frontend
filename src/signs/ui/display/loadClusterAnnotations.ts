import _ from 'lodash'
import SignService from 'signs/application/SignService'
import { CroppedAnnotation } from 'signs/domain/CroppedAnnotation'
import ConcurrencyLimiter from 'common/utils/ConcurrencyLimiter'

const clusterVariantConcurrencyLimit = 4

export interface ClusterAnnotationsResult {
  annotations: CroppedAnnotation[]
  hasFailures: boolean
}

export default async function loadClusterAnnotations({
  croppedAnnotations,
  signService,
  signName,
  scriptAbbr,
}: {
  croppedAnnotations: CroppedAnnotation[]
  signService: SignService
  signName: string
  scriptAbbr: string
}): Promise<ClusterAnnotationsResult> {
  const clusterIds = _.uniq(
    croppedAnnotations
      .map((annotation) => annotation.pcaClustering?.clusterId)
      .filter((clusterId): clusterId is string => Boolean(clusterId)),
  )

  if (!clusterIds.length) {
    return {
      annotations: croppedAnnotations,
      hasFailures: false,
    }
  }

  const limiter = new ConcurrencyLimiter(clusterVariantConcurrencyLimit)
  const results = await Promise.allSettled(
    clusterIds.map((clusterId) =>
      limiter.run(() =>
        signService.getClusterVariants(signName, clusterId, scriptAbbr),
      ),
    ),
  )

  const fallbackClusterIds = results
    .map((result, index) =>
      result.status === 'rejected' ||
      (result.status === 'fulfilled' && result.value.length === 0)
        ? clusterIds[index]
        : null,
    )
    .filter((clusterId): clusterId is string => Boolean(clusterId))

  const successfulAnnotations = results
    .filter(
      (result): result is PromiseFulfilledResult<CroppedAnnotation[]> =>
        result.status === 'fulfilled' && result.value.length > 0,
    )
    .flatMap((result) => result.value)

  const fallbackAnnotations = croppedAnnotations.filter((annotation) =>
    fallbackClusterIds.includes(annotation.pcaClustering?.clusterId || ''),
  )

  const nonPcaAnnotations = croppedAnnotations.filter(
    (annotation) => !annotation.pcaClustering?.clusterId,
  )

  return {
    annotations:
      successfulAnnotations.length ||
      fallbackAnnotations.length ||
      nonPcaAnnotations.length
        ? [
            ...successfulAnnotations,
            ...fallbackAnnotations,
            ...nonPcaAnnotations,
          ]
        : croppedAnnotations,
    hasFailures: fallbackClusterIds.length > 0,
  }
}
