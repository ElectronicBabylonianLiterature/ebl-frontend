import React, { useCallback } from 'react'
import { Line } from 'corpus/domain/line'
import { useEditLiteContext } from 'corpus/ui/edit-lite/EditLiteContext'
import { LineState } from 'corpus/ui/edit-lite/editLiteState'
import LineEditPanel from 'corpus/ui/edit-lite/LineEditPanel'
import LineEditToolbar from 'corpus/ui/edit-lite/LineEditToolbar'
import { findProgressLabel, LineActivity } from 'corpus/ui/edit-lite/lineStates'

export interface LineViewProps {
  readonly index: number
  readonly lineState: LineState
  readonly activity: LineActivity
}

export interface LineTextViewProps extends LineViewProps {
  readonly draft: Line
  readonly isNew: boolean
  readonly onDeleted: (index: number) => void
}

export default function LineTextView({
  index,
  lineState,
  draft,
  isNew,
  activity,
  onDeleted,
}: LineTextViewProps): JSX.Element {
  const { actions, canWrite } = useEditLiteContext()
  const original = lineState.original
  const handleChange = useCallback(
    (line: Line): void => actions.changeLine(index, line, original),
    [actions, index, original],
  )

  return (
    <>
      <LineEditPanel
        line={draft}
        onChange={handleChange}
        disabled={findProgressLabel(lineState.status) !== null}
      />
      {canWrite && (
        <LineEditToolbar
          index={index}
          lineState={lineState}
          draft={draft}
          isNew={isNew}
          activity={activity}
          onDeleted={onDeleted}
        />
      )}
    </>
  )
}
