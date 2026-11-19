import React from 'react'
import DryRunModal from 'corpus/ui/edit-lite/DryRunModal'

interface Props {
  readonly target: string
  readonly payload: Readonly<Record<string, unknown>> | null
  readonly onHide: () => void
}

export const manuscriptsPreviewNotice =
  'Dry run: nothing was sent to the server. This is the request that saving the manuscripts would send.'

export default function EditLiteManuscriptPreview({
  target,
  payload,
  onHide,
}: Props): JSX.Element {
  return (
    <DryRunModal
      payload={payload}
      onHide={onHide}
      target={target}
      notice={manuscriptsPreviewNotice}
    />
  )
}
