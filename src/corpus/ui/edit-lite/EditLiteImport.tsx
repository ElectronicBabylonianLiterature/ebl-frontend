import React, { useState } from 'react'
import { Alert } from 'react-bootstrap'
import Spinner from 'common/ui/Spinner'
import { ChapterRequest } from 'corpus/application/edit-lite/ChapterEditSource'
import DryRunModal, {
  createDryRunNotice,
} from 'corpus/ui/edit-lite/DryRunModal'
import { useEditLiteContext } from 'corpus/ui/edit-lite/EditLiteContext'
import { LineImport } from 'corpus/ui/edit-lite/useLineImport'
import ChapterImport from 'corpus/ui/import/ChapterImport'
import 'corpus/ui/edit-lite/edit-lite.sass'

interface Props {
  readonly lineImport: LineImport
}

export const importDryRunNotice = createDryRunNotice('importing the lines')
export const importNotice =
  'Read-only data source: importing is a dry run that only shows the request.'

export default function EditLiteImport({
  lineImport: { isImporting, error, importLines },
}: Props): JSX.Element {
  const { canSave, describeChange } = useEditLiteContext()
  const [preview, setPreview] = useState<ChapterRequest | null>(null)
  const previewImport = (atf: string): void =>
    setPreview(describeChange({ type: 'importLines', atf }))

  return (
    <div className="edit-lite-import">
      {error !== null && (
        <Alert className="edit-lite-line__alert" variant="danger">
          {error}
        </Alert>
      )}
      <ChapterImport
        onSave={canSave ? importLines : previewImport}
        disabled={isImporting}
      />
      {isImporting && <Spinner>Importing...</Spinner>}
      {!canSave && (
        <span className="edit-lite-line__notice">{importNotice}</span>
      )}
      <DryRunModal
        request={preview}
        notice={importDryRunNotice}
        onHide={(): void => setPreview(null)}
      />
    </div>
  )
}
