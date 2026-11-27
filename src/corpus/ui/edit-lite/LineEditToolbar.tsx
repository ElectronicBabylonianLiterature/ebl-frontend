import React, { useState } from 'react'
import { Button } from 'react-bootstrap'
import { Line } from 'corpus/domain/line'
import ConfirmModal from 'corpus/ui/edit-lite/ConfirmModal'
import { useEditLiteContext } from 'corpus/ui/edit-lite/EditLiteContext'
import { isLineDirty } from 'corpus/ui/edit-lite/editLiteReducer'
import { LineState } from 'corpus/ui/edit-lite/editLiteState'
import {
  findProgressLabel,
  isLayoutChanging,
  LineActivity,
} from 'corpus/ui/edit-lite/lineStates'
import { findLineProblem } from 'corpus/ui/edit-lite/lineValidation'
import SaveControls from 'corpus/ui/edit-lite/SaveControls'
import 'corpus/ui/edit-lite/edit-lite.sass'

interface Props {
  readonly index: number
  readonly lineState: LineState
  readonly draft: Line
  readonly isNew: boolean
  readonly activity: LineActivity
  readonly onDeleted: (index: number) => void
}

export const discardedChangesNote =
  'The unsaved changes of this line are discarded with it.'

function describeDeletion(storedLine: Line, isUnsaved: boolean): string {
  return [
    `Delete line ${storedLine.number} from the chapter?`,
    'Its variants and manuscript lines are removed with it.',
    ...(isUnsaved ? [discardedChangesNote] : []),
    'This cannot be undone.',
  ].join(' ')
}

export default function LineEditToolbar({
  index,
  lineState,
  draft,
  isNew,
  activity,
  onDeleted,
}: Props): JSX.Element {
  const { actions, manuscripts } = useEditLiteContext()
  const [isConfirmingDelete, setIsConfirmingDelete] = useState<boolean>(false)
  const problem = findLineProblem(draft, manuscripts)
  const progressLabel = findProgressLabel(lineState.status)
  const isUnsaved = isNew || isLineDirty(lineState)
  const deleteLine = (): void => {
    setIsConfirmingDelete(false)
    actions.deleteLine(index, (): void => onDeleted(index))
  }

  return (
    <>
      {problem !== null && (
        <p className="edit-lite-line__problem" role="status">
          {problem}
        </p>
      )}
      <SaveControls
        saveLabel="Save line"
        resetLabel={isNew ? 'Discard new line' : 'Reset'}
        canSubmit={isUnsaved && problem === null && !isLayoutChanging(activity)}
        canReset={isUnsaved || lineState.status === 'failed'}
        progressLabel={progressLabel}
        onSave={(): void => actions.saveLine(index)}
        onReset={(): void => actions.resetLine(index)}
      >
        {!isNew && (
          <Button
            size="sm"
            variant="outline-danger"
            disabled={progressLabel !== null || activity !== 'idle'}
            onClick={(): void => setIsConfirmingDelete(true)}
          >
            Delete line
          </Button>
        )}
      </SaveControls>
      <ConfirmModal
        show={isConfirmingDelete}
        title="Delete line"
        confirmLabel="Delete line"
        onConfirm={deleteLine}
        onCancel={(): void => setIsConfirmingDelete(false)}
      >
        {describeDeletion(lineState.original ?? draft, isUnsaved)}
      </ConfirmModal>
    </>
  )
}
