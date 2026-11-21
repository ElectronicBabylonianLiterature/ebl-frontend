import React, { useState } from 'react'
import { Button } from 'react-bootstrap'
import Spinner from 'common/ui/Spinner'
import {
  ChapterChange,
  ChapterRequest,
} from 'corpus/application/edit-lite/ChapterEditSource'
import { Line } from 'corpus/domain/line'
import ConfirmModal from 'corpus/ui/edit-lite/ConfirmModal'
import DryRunModal, {
  createDryRunNotice,
  dryRunNotice,
} from 'corpus/ui/edit-lite/DryRunModal'
import { useEditLiteContext } from 'corpus/ui/edit-lite/EditLiteContext'
import { isLineDirty } from 'corpus/ui/edit-lite/editLiteReducer'
import { LineState } from 'corpus/ui/edit-lite/editLiteState'
import {
  findProgressLabel,
  isLayoutChanging,
  LineActivity,
} from 'corpus/ui/edit-lite/lineStates'
import { findLineProblem } from 'corpus/ui/edit-lite/lineValidation'
import 'corpus/ui/edit-lite/edit-lite.sass'

interface Props {
  readonly index: number
  readonly lineState: LineState
  readonly draft: Line
  readonly isNew: boolean
  readonly activity: LineActivity
  readonly onDeleted: (index: number) => void
}

interface Preview {
  readonly request: ChapterRequest
  readonly notice: string
}

export const lineDryRunNotice =
  'Read-only data source: saving is a dry run that only shows the request.'
export const deleteDryRunNotice = createDryRunNotice('deleting the line')
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
  const { actions, canSave, describeChange, manuscripts } = useEditLiteContext()
  const [preview, setPreview] = useState<Preview | null>(null)
  const [isConfirmingDelete, setIsConfirmingDelete] = useState<boolean>(false)
  const problem = findLineProblem(draft, manuscripts)
  const progressLabel = findProgressLabel(lineState.status)
  const isBusy = progressLabel !== null
  const isUnsaved = isNew || isLineDirty(lineState)
  const canReset = isUnsaved || lineState.status === 'failed'
  const saveChange: ChapterChange = isNew
    ? { type: 'addLine', line: draft }
    : { type: 'saveLine', index, line: draft }
  const openPreview = (change: ChapterChange, notice: string): void =>
    setPreview({ request: describeChange(change), notice })
  const previewSave = (): void => openPreview(saveChange, dryRunNotice)
  const deleteLine = (): void => {
    setIsConfirmingDelete(false)
    if (canSave) {
      actions.deleteLine(index, (): void => onDeleted(index))
    } else {
      openPreview({ type: 'deleteLine', index }, deleteDryRunNotice)
    }
  }

  return (
    <>
      {problem !== null && (
        <p className="edit-lite-line__problem" role="status">
          {problem}
        </p>
      )}
      <div className="edit-lite-line__actions">
        <Button
          size="sm"
          variant="primary"
          disabled={
            !isUnsaved ||
            isBusy ||
            problem !== null ||
            isLayoutChanging(activity)
          }
          onClick={canSave ? (): void => actions.saveLine(index) : previewSave}
        >
          Save line
        </Button>
        <Button size="sm" variant="outline-secondary" onClick={previewSave}>
          Preview request
        </Button>
        <Button
          size="sm"
          variant="outline-secondary"
          disabled={isBusy || !canReset}
          onClick={(): void => actions.resetLine(index)}
        >
          {isNew ? 'Discard new line' : 'Reset'}
        </Button>
        {!isNew && (
          <Button
            size="sm"
            variant="outline-danger"
            disabled={isBusy || activity !== 'idle'}
            onClick={(): void => setIsConfirmingDelete(true)}
          >
            Delete line
          </Button>
        )}
        {isBusy && <Spinner>{progressLabel}</Spinner>}
        {!canSave && (
          <span className="edit-lite-line__notice">{lineDryRunNotice}</span>
        )}
      </div>
      <ConfirmModal
        show={isConfirmingDelete}
        title="Delete line"
        confirmLabel="Delete line"
        onConfirm={deleteLine}
        onCancel={(): void => setIsConfirmingDelete(false)}
      >
        {describeDeletion(lineState.original ?? draft, isUnsaved)}
      </ConfirmModal>
      <DryRunModal
        request={preview?.request ?? null}
        notice={preview?.notice}
        onHide={(): void => setPreview(null)}
      />
    </>
  )
}
