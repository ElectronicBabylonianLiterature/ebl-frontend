import React from 'react'
import { ChapterRequest } from 'corpus/application/edit-lite/ChapterEditSource'
import DryRunModal, {
  createDryRunNotice,
} from 'corpus/ui/edit-lite/DryRunModal'

interface Props {
  readonly request: ChapterRequest | null
  readonly onHide: () => void
}

export const manuscriptsPreviewNotice = createDryRunNotice(
  'saving the manuscripts',
)

export default function EditLiteManuscriptPreview({
  request,
  onHide,
}: Props): JSX.Element {
  return (
    <DryRunModal
      request={request}
      onHide={onHide}
      notice={manuscriptsPreviewNotice}
    />
  )
}
