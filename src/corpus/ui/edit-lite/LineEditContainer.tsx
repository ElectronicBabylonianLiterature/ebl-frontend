import React, { useCallback, useEffect, useState } from 'react'
import { Alert, Button } from 'react-bootstrap'
import Spinner from 'common/ui/Spinner'
import {
  ChapterEditSourceKind,
  LinesUpdateDto,
} from 'corpus/application/edit-lite/ChapterEditSource'
import { Line } from 'corpus/domain/line'
import DryRunModal from 'corpus/ui/edit-lite/DryRunModal'
import { useEditLiteContext } from 'corpus/ui/edit-lite/EditLiteContext'
import { isLineDirty } from 'corpus/ui/edit-lite/editLiteReducer'
import { LineState } from 'corpus/ui/edit-lite/editLiteState'
import LineEditPanel from 'corpus/ui/edit-lite/LineEditPanel'
import 'corpus/ui/edit-lite/edit-lite.sass'

interface Props {
  readonly index: number
  readonly lineState: LineState | undefined
}

interface LoadedLineProps {
  readonly index: number
  readonly lineState: LineState
  readonly draft: Line
}

const dryRunNotices: Readonly<Record<ChapterEditSourceKind, string>> = {
  legacy:
    'Read-only data source: saving is a dry run that only shows the request.',
  api: 'You are not allowed to save texts: saving is a dry run that only shows the request.',
}

function LoadedLine({ index, lineState, draft }: LoadedLineProps): JSX.Element {
  const context = useEditLiteContext()
  const { actions, canSave, kind } = context
  const [preview, setPreview] = useState<LinesUpdateDto | null>(null)
  const isDirty = isLineDirty(lineState)
  const isSaving = lineState.status === 'saving'
  const isFailed = lineState.status === 'failed'
  const handleChange = useCallback(
    (line: Line): void => actions.changeLine(index, line),
    [actions, index],
  )
  const openPreview = (): void => setPreview(context.describeSave(index, draft))

  return (
    <>
      {isFailed && (
        <Alert className="edit-lite-line__alert" variant="danger">
          {lineState.error}
        </Alert>
      )}
      <LineEditPanel line={draft} onChange={handleChange} disabled={isSaving} />
      <div className="edit-lite-line__actions">
        <Button
          size="sm"
          variant="primary"
          disabled={!isDirty || isSaving}
          onClick={canSave ? (): void => actions.saveLine(index) : openPreview}
        >
          Save line
        </Button>
        <Button size="sm" variant="outline-secondary" onClick={openPreview}>
          Preview request
        </Button>
        <Button
          size="sm"
          variant="outline-secondary"
          disabled={isSaving || !(isDirty || isFailed)}
          onClick={(): void => actions.resetLine(index)}
        >
          Reset
        </Button>
        {isSaving && <Spinner>Saving...</Spinner>}
        {!canSave && (
          <span className="edit-lite-line__notice">{dryRunNotices[kind]}</span>
        )}
      </div>
      {preview !== null && (
        <DryRunModal payload={preview} onHide={(): void => setPreview(null)} />
      )}
    </>
  )
}

function LineContent({ index, lineState }: Props): JSX.Element {
  const { actions } = useEditLiteContext()

  if (lineState !== undefined && lineState.draft !== null) {
    return (
      <LoadedLine index={index} lineState={lineState} draft={lineState.draft} />
    )
  }
  return lineState?.status === 'failed' ? (
    <Alert className="edit-lite-line__alert" variant="danger">
      {lineState.error}{' '}
      <Button
        size="sm"
        variant="outline-danger"
        onClick={(): void => actions.resetLine(index)}
      >
        Retry
      </Button>
    </Alert>
  ) : (
    <Spinner>Loading line...</Spinner>
  )
}

function LineEditContainer({ index, lineState }: Props): JSX.Element {
  const { actions } = useEditLiteContext()

  useEffect(() => {
    if (lineState === undefined) {
      actions.ensureLines(index, 1)
    }
  }, [actions, index, lineState])

  return (
    <div
      className="edit-lite-line"
      role="group"
      aria-label={`Editor for the line at position ${index + 1}`}
    >
      <LineContent index={index} lineState={lineState} />
    </div>
  )
}

export default React.memo(LineEditContainer)
