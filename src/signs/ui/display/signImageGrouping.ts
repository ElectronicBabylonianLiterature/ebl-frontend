import _ from 'lodash'
import { CroppedAnnotation } from 'signs/domain/CroppedAnnotation'

export function sortVariants(
  annotations: CroppedAnnotation[],
): CroppedAnnotation[] {
  return _.sortBy(annotations, [
    (annotation) => (annotation.date ? 0 : 1),
    (annotation) => annotation.fragmentNumber,
  ])
}

export function sortGroupsByClusterRank(
  annotations: CroppedAnnotation[],
): [string, CroppedAnnotation[]][] {
  return _.sortBy(
    Object.entries(
      _.groupBy(
        annotations,
        (annotation) => annotation.pcaClustering?.clusterId || 'no-cluster',
      ),
    ),
    [
      ([clusterId]) => (clusterId === 'no-cluster' ? 1 : 0),
      ([, group]) => group[0].pcaClustering?.clusterRank ?? 999,
    ],
  )
}

export function formatFormLabel(form: string): string {
  if (form.startsWith('canonical')) {
    const number = form.replace('canonical', '')
    return number ? `Canonical ${number}` : 'Canonical'
  }
  if (form.startsWith('variant')) {
    const number = form.replace('variant', '')
    return number ? `Variant ${number}` : 'Variant'
  }
  return form
}
