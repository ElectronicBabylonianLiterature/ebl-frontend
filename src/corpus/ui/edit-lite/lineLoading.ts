import _ from 'lodash'
import { ChapterEditSource } from 'corpus/application/edit-lite/ChapterEditSource'
import { Line } from 'corpus/domain/line'
import { EditLiteState } from 'corpus/ui/edit-lite/editLiteState'
import { EditLiteStore, errorMessage } from 'corpus/ui/edit-lite/editLiteStore'

export const lineNotReturnedMessage =
  'The line was not returned by the data source.'

export function toContiguousRanges(indices: readonly number[]): number[][] {
  return _.sortBy(_.uniq(indices)).reduce<number[][]>((ranges, index) => {
    const lastRange = _.last(ranges)
    if (lastRange !== undefined && _.last(lastRange) === index - 1) {
      lastRange.push(index)
    } else {
      ranges.push([index])
    }
    return ranges
  }, [])
}

export function findMissingIndices(
  state: EditLiteState,
  offset: number,
  limit: number,
): number[] {
  return _.range(
    Math.max(offset, 0),
    Math.min(offset + limit, state.outline.lines.length),
  ).filter((index) => !(index in state.lines))
}

function storeLoadedRange(
  store: EditLiteStore,
  indices: readonly number[],
  lines: readonly Line[],
): void {
  store.dispatch({
    type: 'linesLoaded',
    offset: indices[0],
    lines: lines.slice(0, indices.length),
  })
  const missingIndices = indices.slice(lines.length)
  if (missingIndices.length > 0) {
    store.dispatch({
      type: 'linesFailed',
      indices: missingIndices,
      error: lineNotReturnedMessage,
    })
  }
}

export async function loadRange(
  store: EditLiteStore,
  indices: readonly number[],
): Promise<void> {
  const layoutVersion = store.getState().layoutVersion
  const isCurrent = (): boolean =>
    store.getState().layoutVersion === layoutVersion
  try {
    const lines = await store.getSource().loadLines(indices[0], indices.length)
    if (isCurrent()) {
      storeLoadedRange(store, indices, lines)
    }
  } catch (error) {
    if (isCurrent()) {
      store.dispatch({
        type: 'linesFailed',
        indices,
        error: errorMessage(error),
      })
    }
  }
}

export async function loadLine(
  source: ChapterEditSource,
  index: number,
): Promise<Line | null> {
  const [line] = await source
    .loadLines(index, 1)
    .catch((): readonly Line[] => [])
  return line ?? null
}
