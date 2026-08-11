import _ from 'lodash'
import SignService from 'signs/application/SignService'
import { CroppedAnnotation } from 'signs/domain/CroppedAnnotation'
import { runWithConcurrencyLimit } from 'signs/ui/display/signImageGrouping'

export async function loadClusterAnnotations({
  croppedAnnotations,
  signService,
  signName,
  scriptAbbr,
}: {
  croppedAnnotations: CroppedAnnotation[]
  signService: SignService
  signName: string
  scriptAbbr: string
}): Promise<{
  annotations: CroppedAnnotation[]
  hasFailures: boolean
}> {
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

  const results = await runWithConcurrencyLimit<string, CroppedAnnotation[]>(
    clusterIds,
    4,
    (clusterId) =>
      signService.getClusterVariants(signName, clusterId, scriptAbbr),
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
    annotations: [
      ...successfulAnnotations,
      ...fallbackAnnotations,
      ...nonPcaAnnotations,
    ],
    hasFailures: fallbackClusterIds.length > 0,
  }
}
