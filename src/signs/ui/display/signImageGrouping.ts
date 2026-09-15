import _ from 'lodash'
import { CroppedAnnotation } from 'signs/domain/CroppedAnnotation'
import { periods } from 'common/utils/period'

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

export function sortScriptsByPeriod<Annotation>(
  scripts: Record<string, Annotation[]>,
): [string, Annotation[]][] {
  const periodsAbbr = [...periods.map((period) => period.abbreviation), '']

  return _.sortBy(Object.entries(scripts), ([script]) => {
    const index = periodsAbbr.indexOf(script)
    if (index === -1) {
      throw new Error(`${script} has to be one of ${periodsAbbr}`)
    }
    return index
  })
}

export async function runWithConcurrencyLimit<T, R>(
  items: T[],
  limit: number,
  task: (item: T) => PromiseLike<R>,
): Promise<PromiseSettledResult<R>[]> {
  const results: PromiseSettledResult<R>[] = []
  let index = 0

  async function worker() {
    while (index < items.length) {
      const currentIndex = index
      index += 1

      try {
        results[currentIndex] = {
          status: 'fulfilled',
          value: await task(items[currentIndex]),
        }
      } catch (reason) {
        results[currentIndex] = {
          status: 'rejected',
          reason,
        }
      }
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, () => worker()),
  )

  return results
}
