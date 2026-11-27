import React from 'react'
import { Alert } from 'react-bootstrap'
import Spinner from 'common/ui/Spinner'
import { LineImport } from 'corpus/ui/edit-lite/useLineImport'
import ChapterImport from 'corpus/ui/import/ChapterImport'
import 'corpus/ui/edit-lite/edit-lite.sass'

interface Props {
  readonly lineImport: LineImport
}

export default function EditLiteImport({
  lineImport: { isImporting, error, importLines },
}: Props): JSX.Element {
  return (
    <div className="edit-lite-import">
      {error !== null && (
        <Alert className="edit-lite-line__alert" variant="danger">
          {error}
        </Alert>
      )}
      <ChapterImport onSave={importLines} disabled={isImporting} />
      {isImporting && <Spinner>Importing...</Spinner>}
    </div>
  )
}
