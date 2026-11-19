import React, { useCallback, useMemo, useState } from 'react'
import { useEditLiteContext } from 'corpus/ui/edit-lite/EditLiteContext'
import { EditLiteState } from 'corpus/ui/edit-lite/editLiteState'
import { SiglumLookup } from 'corpus/ui/edit-lite/StaticScoreContent'
import StaticScoreLine, {
  isLoadFailed,
} from 'corpus/ui/edit-lite/StaticScoreLine'
import useStableCallback from 'corpus/ui/edit-lite/useStableCallback'
import 'corpus/ui/edit-lite/ScoreLines.sass'

interface Props {
  readonly state: EditLiteState
}

function withIndex(
  indices: ReadonlySet<number>,
  index: number,
): ReadonlySet<number> {
  return new Set(indices).add(index)
}

function withoutIndex(
  indices: ReadonlySet<number>,
  index: number,
): ReadonlySet<number> {
  return new Set([...indices].filter((other) => other !== index))
}

export default function ScoreLines({ state }: Props): JSX.Element {
  const { manuscripts, actions } = useEditLiteContext()
  const lines = state.outline.lines
  const sigla = useMemo<SiglumLookup>(
    () =>
      new Map(
        manuscripts.map((manuscript) => [manuscript.id, manuscript.siglum]),
      ),
    [manuscripts],
  )
  const [editingIndices, setEditingIndices] = useState<ReadonlySet<number>>(
    () => new Set<number>(),
  )
  const startEditing = useCallback((index: number): void => {
    setEditingIndices((indices) => withIndex(indices, index))
  }, [])
  const stopEditing = useCallback((index: number): void => {
    setEditingIndices((indices) => withoutIndex(indices, index))
  }, [])
  const retryFailedLines = useStableCallback((): void => {
    Object.entries(state.lines)
      .filter(([, lineState]) => isLoadFailed(lineState))
      .forEach(([index]) => actions.resetLine(Number(index)))
  })

  return lines.length === 0 ? (
    <p className="edit-lite-score__hint">This chapter has no lines.</p>
  ) : (
    <div className="edit-lite-score">
      <p className="edit-lite-score__hint">
        Select a line to edit it. Manuscript lines load as you scroll.
      </p>
      <div className="edit-lite-score__lines">
        {lines.map((line) => (
          <StaticScoreLine
            key={line.index}
            line={line}
            lineState={state.lines[line.index]}
            sigla={sigla}
            isEditing={editingIndices.has(line.index)}
            onEdit={startEditing}
            onDone={stopEditing}
            onRetry={retryFailedLines}
          />
        ))}
      </div>
    </div>
  )
}
