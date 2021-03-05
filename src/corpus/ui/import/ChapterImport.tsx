import _ from 'lodash'
import React, { useState } from 'react'
import { Button } from 'react-bootstrap'
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
      <Editor
        name={_.uniqueId('ChapterImport-')}
        value={atf}
        onChange={setAtf}
        disabled={disabled}
      />
      <Button onClick={() => onSave(atf)}>Save</Button>
    </>
  )
}
