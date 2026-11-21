import React, { useState } from 'react'
import { Button } from 'react-bootstrap'
import Spinner from 'common/ui/Spinner'
import {
  ChapterChange,
  ChapterRequest,
} from 'corpus/application/edit-lite/ChapterEditSource'
import DryRunModal from 'corpus/ui/edit-lite/DryRunModal'
import { useEditLiteContext } from 'corpus/ui/edit-lite/EditLiteContext'
import 'corpus/ui/edit-lite/edit-lite.sass'

interface Props {
  readonly saveLabel: string
  readonly resetLabel?: string
  readonly change: ChapterChange
  readonly canSubmit: boolean
  readonly canReset: boolean
  readonly progressLabel: string | null
  readonly onSave: () => void
  readonly onReset: () => void
  readonly children?: React.ReactNode
}

export const lineDryRunNotice =
  'Read-only data source: saving is a dry run that only shows the request.'

export default function SaveControls({
  saveLabel,
  resetLabel = 'Reset',
  change,
  canSubmit,
  canReset,
  progressLabel,
  onSave,
  onReset,
  children,
}: Props): JSX.Element {
  const { canSave, describeChange } = useEditLiteContext()
  const [preview, setPreview] = useState<ChapterRequest | null>(null)
  const isBusy = progressLabel !== null
  const previewSave = (): void => setPreview(describeChange(change))

  return (
    <>
      <div className="edit-lite-line__actions">
        <Button
          size="sm"
          variant="primary"
          disabled={!canSubmit || isBusy}
          onClick={canSave ? onSave : previewSave}
        >
          {saveLabel}
        </Button>
        <Button size="sm" variant="outline-secondary" onClick={previewSave}>
          Preview request
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
        {!canSave && (
          <span className="edit-lite-line__notice">{lineDryRunNotice}</span>
        )}
      </div>
      <DryRunModal request={preview} onHide={(): void => setPreview(null)} />
    </>
  )
}
