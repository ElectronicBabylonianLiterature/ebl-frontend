import _ from 'lodash'
import populateIds from 'corpus/application/populateIds'
import { Manuscript } from 'corpus/domain/manuscript'
import { isManuscriptEdited } from 'corpus/ui/edit-lite/EditLiteManuscriptSummary'
import { pluralize } from 'corpus/ui/edit-lite/lineSummary'

export type ManuscriptStatus = 'unchanged' | 'edited' | 'new'

export function addManuscript(
  manuscripts: readonly Manuscript[],
): readonly Manuscript[] {
  return populateIds([...manuscripts, new Manuscript()])
}

export function removeAt<Item>(
  items: readonly Item[],
  index: number,
): readonly Item[] {
  return items.filter((_item, itemIndex) => itemIndex !== index)
}

export function shiftOpenIndices(
  openIndices: readonly number[],
  deletedIndex: number,
): readonly number[] {
  return openIndices
    .filter((index) => index !== deletedIndex)
    .map((index) => (index > deletedIndex ? index - 1 : index))
}

function findStatus(
  original: Manuscript | undefined,
  manuscript: Manuscript,
): ManuscriptStatus {
  if (original === undefined) {
    return 'new'
  }
  return isManuscriptEdited(original, manuscript) ? 'edited' : 'unchanged'
}

export function findManuscriptStatuses(
  originals: readonly Manuscript[],
  manuscripts: readonly Manuscript[],
): readonly ManuscriptStatus[] {
  const originalsById = new Map(
    originals.map((original) => [original.id, original]),
  )
  return manuscripts.map((manuscript) =>
    findStatus(originalsById.get(manuscript.id), manuscript),
  )
}

export function countDeletedManuscripts(
  originals: readonly Manuscript[],
  manuscripts: readonly Manuscript[],
): number {
  return _.differenceBy(originals, manuscripts, 'id').length
}

export function summarizeManuscriptEdits(
  statuses: readonly ManuscriptStatus[],
  deletedCount: number,
): string {
  const counts = _.countBy(statuses)
  return [
    pluralize(statuses.length, 'manuscript'),
    ...[
      [counts.edited ?? 0, 'edited'] as const,
      [counts.new ?? 0, 'new'] as const,
      [deletedCount, 'deleted'] as const,
    ]
      .filter(([count]) => count > 0)
      .map(([count, label]) => `${count} ${label}`),
  ].join(', ')
}
