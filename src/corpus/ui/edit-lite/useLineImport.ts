import { useCallback, useState } from 'react'
import {
  EditLiteActions,
  ImportedLines,
} from 'corpus/ui/edit-lite/EditLiteContext'

export interface LineImport {
  readonly isImporting: boolean
  readonly error: string | null
  importLines(atf: string): void
}

export default function useLineImport(
  actions: EditLiteActions,
  onImported: (importedLines: ImportedLines) => void,
): LineImport {
  const [isImporting, setIsImporting] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const importLines = useCallback(
    (atf: string): void => {
      setIsImporting(true)
      setError(null)
      actions
        .importLines(atf)
        .then(onImported)
        .catch((importError: Error) => setError(importError.message))
        .finally(() => setIsImporting(false))
    },
    [actions, onImported],
  )

  return { isImporting, error, importLines }
}
