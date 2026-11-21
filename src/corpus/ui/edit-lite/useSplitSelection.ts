import { useCallback, useState } from 'react'
import _ from 'lodash'
import { EditLiteState } from 'corpus/ui/edit-lite/editLiteState'
import { findInitialIndex } from 'corpus/ui/edit-lite/lineIndex'
import { deleteIndex, moveIndex } from 'corpus/ui/edit-lite/lineMove'
import { countLines } from 'corpus/ui/edit-lite/lineStates'

interface Selection {
  readonly index: number
  readonly editorKey: number
}

export interface SplitSelection extends Selection {
  readonly select: (index: number) => void
  readonly selectNewLine: () => void
  readonly followMove: (from: number, to: number) => void
  readonly followDelete: (deletedIndex: number) => void
}

function selectIndex(selection: Selection, index: number): Selection {
  return index === selection.index
    ? selection
    : { index, editorKey: selection.editorKey + 1 }
}

function followDeletedLine(
  selection: Selection,
  deletedIndex: number,
): Selection {
  return {
    index: deleteIndex(selection.index, deletedIndex),
    editorKey: selection.editorKey + Number(selection.index === deletedIndex),
  }
}

export default function useSplitSelection(
  state: EditLiteState,
  initialLine?: number,
): SplitSelection {
  const lineCount = state.outline.lines.length
  const lastIndex = countLines(state) - 1
  const [selection, setSelection] = useState<Selection>(() => ({
    index: findInitialIndex(initialLine, lineCount) ?? 0,
    editorKey: 0,
  }))
  const select = useCallback(
    (index: number): void =>
      setSelection((current) =>
        selectIndex(current, _.clamp(index, 0, lastIndex)),
      ),
    [lastIndex],
  )
  const selectNewLine = useCallback(
    (): void => setSelection((current) => selectIndex(current, lineCount)),
    [lineCount],
  )
  const followMove = useCallback(
    (from: number, to: number): void =>
      setSelection((current) => ({
        ...current,
        index: moveIndex(current.index, from, to),
      })),
    [],
  )
  const followDelete = useCallback(
    (deletedIndex: number): void =>
      setSelection((current) => followDeletedLine(current, deletedIndex)),
    [],
  )

  if (selection.index > lastIndex) {
    setSelection(selectIndex(selection, lastIndex))
  }

  return {
    index: Math.min(selection.index, lastIndex),
    editorKey: selection.editorKey,
    select,
    selectNewLine,
    followMove,
    followDelete,
  }
}
