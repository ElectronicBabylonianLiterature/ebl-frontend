import { ApiError } from 'http/ApiClient'
import {
  editionFields,
  EditionFields,
} from 'fragmentarium/application/FragmentService'

type EditedValues = Record<(typeof editionFields)[number], string>

const retryableErrorStatuses = new Set([401, 408, 429])
const rejectedAttemptLimit = 20

export function isDeterministicFailure(error: Error): boolean {
  if (!(error instanceof ApiError) || error.status === undefined) {
    return false
  }
  const clientError = error.status >= 400 && error.status < 500
  return clientError && !retryableErrorStatuses.has(error.status)
}

export function createAttemptKey(values: EditedValues): string {
  return JSON.stringify(editionFields.map((field) => values[field]))
}

export function createUpdatedFields(
  editedValues: EditedValues,
  initialValues: EditedValues,
): EditionFields {
  return editionFields.reduce<EditionFields>(
    (updates, field) =>
      editedValues[field] === initialValues[field]
        ? updates
        : { ...updates, [field]: editedValues[field] },
    {},
  )
}

export function rememberRejectedAttempt(
  previousAttempts: ReadonlySet<string>,
  attemptKey: string,
): ReadonlySet<string> {
  const recent = [...previousAttempts].filter((key) => key !== attemptKey)
  return new Set([...recent, attemptKey].slice(-rejectedAttemptLimit))
}

export function mergeSavedValues(
  currentValues: EditedValues,
  submittedValues: EditedValues,
  savedValues: EditedValues,
): EditedValues {
  const mergedValues = { ...savedValues }
  for (const field of editionFields) {
    if (currentValues[field] !== submittedValues[field]) {
      mergedValues[field] = currentValues[field]
    }
  }
  return mergedValues
}
