import React, { useCallback, useEffect } from 'react'
import { Alert, Button } from 'react-bootstrap'
import Spinner from 'common/ui/Spinner'
import { Line } from 'corpus/domain/line'
import { useEditLiteContext } from 'corpus/ui/edit-lite/EditLiteContext'
import { LineState } from 'corpus/ui/edit-lite/editLiteState'
import LineEditPanel from 'corpus/ui/edit-lite/LineEditPanel'
import LineEditToolbar from 'corpus/ui/edit-lite/LineEditToolbar'
import { LineActivity } from 'corpus/ui/edit-lite/lineStates'
import 'corpus/ui/edit-lite/edit-lite.sass'

interface Props {
  readonly index: number
  readonly lineState: LineState | undefined
  readonly isNew?: boolean
  readonly activity?: LineActivity
}

interface LoadedLineProps extends Required<Props> {
  readonly lineState: LineState
  readonly draft: Line
}

const busyStatuses: readonly string[] = ['saving', 'deleting']

function LoadedLine({
  index,
  lineState,
  draft,
  isNew,
  activity,
}: LoadedLineProps): JSX.Element {
  const { actions, canWrite } = useEditLiteContext()
  const handleChange = useCallback(
    (line: Line): void => actions.changeLine(index, line),
    [actions, index],
  )

  return (
    <>
      {lineState.status === 'failed' && (
        <Alert className="edit-lite-line__alert" variant="danger">
          {lineState.error}
        </Alert>
      )}
      <LineEditPanel
        line={draft}
        onChange={handleChange}
        disabled={busyStatuses.includes(lineState.status)}
      />
      {canWrite && (
        <LineEditToolbar
          index={index}
          lineState={lineState}
          draft={draft}
          isNew={isNew}
          activity={activity}
        />
      )}
    </>
  )
}

function LineContent({
  index,
  lineState,
  isNew,
  activity,
}: Required<Props>): JSX.Element {
  const { actions } = useEditLiteContext()

  if (lineState !== undefined && lineState.draft !== null) {
    return (
      <LoadedLine
        index={index}
        lineState={lineState}
        draft={lineState.draft}
        isNew={isNew}
        activity={activity}
      />
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

function LineEditContainer({
  index,
  lineState,
  isNew = false,
  activity = 'idle',
}: Props): JSX.Element {
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
      <LineContent
        index={index}
        lineState={lineState}
        isNew={isNew}
        activity={activity}
      />
    </div>
  )
}

export default React.memo(LineEditContainer)
