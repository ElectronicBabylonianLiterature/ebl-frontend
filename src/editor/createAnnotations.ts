import { IAnnotation } from 'react-ace'
import _ from 'lodash'

type LineError = { lineNumber: number; description: string }

function hasLineNumber(error: unknown): error is LineError {
  if (typeof error !== 'object' || error === null) {
    return false
  }
  const lineNumber = _.get(error, 'lineNumber')
  if (typeof lineNumber !== 'number' || !Number.isInteger(lineNumber)) {
    return false
  }
  return lineNumber > 0 && typeof _.get(error, 'description') === 'string'
}

export default function createAnnotations(
  compositeError: Error | Record<string, unknown> | null,
): IAnnotation[] {
  const errors: unknown = _.get(compositeError, 'data.errors', [])
  return Array.isArray(errors)
    ? errors.filter(hasLineNumber).map((error) => ({
        row: error.lineNumber - 1,
        column: 0,
        type: 'error',
        text: error.description,
      }))
    : []
}
