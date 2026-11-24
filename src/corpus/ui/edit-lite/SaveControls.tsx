import React from 'react'
import { Button } from 'react-bootstrap'
import Spinner from 'common/ui/Spinner'
import 'corpus/ui/edit-lite/edit-lite.sass'

interface Props {
  readonly saveLabel: string
  readonly resetLabel?: string
  readonly canSubmit: boolean
  readonly canReset: boolean
  readonly progressLabel: string | null
  readonly onSave: () => void
  readonly onReset: () => void
  readonly children?: React.ReactNode
}

export default function SaveControls({
  saveLabel,
  resetLabel = 'Reset',
  canSubmit,
  canReset,
  progressLabel,
  onSave,
  onReset,
  children,
}: Props): JSX.Element {
  const isBusy = progressLabel !== null

  return (
    <div className="edit-lite-line__actions">
      <Button
        size="sm"
        variant="primary"
        disabled={!canSubmit || isBusy}
        onClick={onSave}
      >
        {saveLabel}
      </Button>
      <Button
        size="sm"
        variant="outline-secondary"
        disabled={isBusy || !canReset}
        onClick={onReset}
      >
        {resetLabel}
      </Button>
      {children}
      {isBusy && <Spinner>{progressLabel}</Spinner>}
    </div>
  )
}
