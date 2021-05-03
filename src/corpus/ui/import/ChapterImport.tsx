import _ from 'lodash'
import React, { useState } from 'react'
import { Alert, Button } from 'react-bootstrap'
import Editor from 'editor/Editor'

interface ChapterImportProps {
  onSave: (atf: string) => unknown
  disabled?: boolean
}

export default function ChapterImport({
  onSave,
  disabled = false,
}: ChapterImportProps): JSX.Element {
  const [atf, setAtf] = useState('')
  return (
    <>
      <Alert variant="info">
        The imported lines are added to the end of the chapter. Existing lines
        will not change.
      </Alert>
      <Editor
        name={_.uniqueId('ChapterImport-')}
        value={atf}
        onChange={setAtf}
        disabled={disabled}
      />
      <Button className="m-1" onClick={() => onSave(atf)}>
        Save
      </Button>
    </>
  )
}
