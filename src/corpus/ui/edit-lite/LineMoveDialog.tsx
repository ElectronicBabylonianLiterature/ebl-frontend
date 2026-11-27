import React, { useId, useMemo, useState } from 'react'
import { LineOutline } from 'corpus/application/edit-lite/chapterOutline'
import ConfirmModal from 'corpus/ui/edit-lite/ConfirmModal'
import { listMoveChoices, MoveChoice } from 'corpus/ui/edit-lite/lineMove'
import 'corpus/ui/edit-lite/edit-lite.sass'
import 'corpus/ui/edit-lite/SplitLines.sass'

interface Props {
  readonly lines: readonly LineOutline[]
  readonly index: number
  readonly onMove: (to: number) => void
  readonly onCancel: () => void
}

export const numberingNote =
  'Line numbers are not renumbered: every line keeps its number.'

export default function LineMoveDialog({
  lines,
  index,
  onMove,
  onCancel,
}: Props): JSX.Element {
  const id = useId()
  const choices = useMemo<MoveChoice[]>(
    () => listMoveChoices(lines, index),
    [lines, index],
  )
  const [target, setTarget] = useState<number>(choices[0].to)

  return (
    <ConfirmModal
      show
      title="Move line"
      confirmLabel="Move line"
      confirmVariant="primary"
      onConfirm={(): void => onMove(target)}
      onCancel={onCancel}
    >
      <label className="edit-lite-label" htmlFor={id}>
        Move line {lines[index].number}
      </label>
      <select
        id={id}
        className="edit-lite-input"
        value={target}
        onChange={(event: React.ChangeEvent<HTMLSelectElement>): void =>
          setTarget(Number(event.target.value))
        }
      >
        {choices.map((choice) => (
          <option key={choice.to} value={choice.to}>
            {choice.label}
          </option>
        ))}
      </select>
      <p className="edit-lite-split__move-note">{numberingNote}</p>
    </ConfirmModal>
  )
}
