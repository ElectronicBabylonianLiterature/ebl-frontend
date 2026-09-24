import React, {
  useState,
  useEffect,
  FormEvent,
  useCallback,
  useMemo,
} from 'react'
import { Container, Row, Col } from 'react-bootstrap'
import _ from 'lodash'
import Promise from 'bluebird'

import TemplateForm from 'fragmentarium/ui/edition/TemplateForm'
import { Fragment } from 'fragmentarium/domain/fragment'
import { ErrorBoundary } from '@sentry/react'
import { ApiError } from 'http/ApiClient'
import {
  editionFields,
  EditionFields,
} from 'fragmentarium/application/FragmentService'
import {
  FormData,
  SubmitButton,
  TransliterationFormFields,
} from 'fragmentarium/ui/edition/TransliterationFormControls'

type EditedValues = Pick<FormData, (typeof editionFields)[number]>

const retryableErrorStatuses = new Set([408, 429])
const rejectedAttemptLimit = 20

const isDeterministicFailure = (error: unknown): error is ApiError => {
  if (!(error instanceof ApiError)) {
    return false
  }
  if (typeof error.status !== 'number') {
    return false
  }
  if (error.status < 400) {
    return false
  }
  if (error.status >= 500) {
    return false
  }
  return !retryableErrorStatuses.has(error.status)
}

const createAttemptKey = (values: EditedValues): string =>
  JSON.stringify(editionFields.map((field) => values[field]))

const createUpdatedFields = (
  editedValues: EditedValues,
  initialValues: EditedValues,
): EditionFields =>
  editionFields.reduce<EditionFields>(
    (updates, field) =>
      editedValues[field] === initialValues[field]
        ? updates
        : { ...updates, [field]: editedValues[field] },
    {},
  )

type Props = {
  transliteration: string
  notes: string
  introduction: string
  updateEdition: (fields: EditionFields) => Promise<Fragment>
  disabled?: boolean
}

const handleBeforeUnload = (
  event: BeforeUnloadEvent,
  hasChanges: () => boolean,
): string | void => {
  if (hasChanges()) {
    const confirmationMessage =
      'You have unsaved changes. Are you sure you want to leave?'
    event.returnValue = confirmationMessage
    return confirmationMessage
  }
}

const runBeforeUnloadEvent = ({
  hasChanges,
}: {
  hasChanges: () => boolean
}) => {
  const _handleBeforeEvent = (event) => handleBeforeUnload(event, hasChanges)
  if (hasChanges()) {
    window.addEventListener('beforeunload', _handleBeforeEvent)
  } else {
    window.removeEventListener('beforeunload', _handleBeforeEvent)
  }
  return () => {
    window.removeEventListener('beforeunload', _handleBeforeEvent)
  }
}

const TransliterationForm: React.FC<Props> = ({
  transliteration,
  notes,
  introduction,
  updateEdition,
  disabled: propsDisabled,
}): JSX.Element => {
  const formId = useMemo(() => _.uniqueId('TransliterationForm-'), [])
  const [formData, setFormData] = useState<FormData>({
    transliteration,
    notes,
    introduction,
    error: null,
    disabled: false,
  })
  const [updatePromise, setUpdatePromise] = useState(Promise.resolve())
  const [rejectedAttempts, setRejectedAttempts] = useState<ReadonlySet<string>>(
    new Set(),
  )
  const initialValues = useMemo(
    () => ({ transliteration, notes, introduction }),
    [transliteration, notes, introduction],
  )

  const update =
    (property: (typeof editionFields)[number]) => (value: string) => {
      setFormData((prev) => ({
        ...prev,
        [property]: value,
      }))
    }

  const onTemplate = (template: string) => {
    setFormData((prev) => ({
      ...prev,
      transliteration: template,
    }))
  }

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const editedValues = _.pick(formData, editionFields)
    const updatedFields = createUpdatedFields(editedValues, initialValues)
    const promise = updateEdition(updatedFields)
      .then((fragment) => {
        setRejectedAttempts(new Set())
        setFormData((prev) => ({
          ...prev,
          transliteration: fragment.atf,
          notes: fragment.notes.text,
          introduction: fragment.introduction.text,
          error: null,
        }))
      })
      .catch((error) => {
        const isCancellationError =
          (error as { name?: string })?.name === 'CancellationError' ||
          (typeof (promise as { isCancelled?: () => boolean })?.isCancelled ===
            'function' &&
            (promise as { isCancelled: () => boolean }).isCancelled())
        if (isCancellationError) {
          return
        }
        if (isDeterministicFailure(error)) {
          setRejectedAttempts((previousAttempts) => {
            const attemptKey = createAttemptKey(editedValues)
            const recent = [...previousAttempts].filter(
              (key) => key !== attemptKey,
            )
            return new Set([...recent, attemptKey].slice(-rejectedAttemptLimit))
          })
        }
        setFormData((prev) => ({ ...prev, error }))
      })
    setUpdatePromise(promise)
  }

  const hasChanges = useCallback(
    (): boolean =>
      formData.transliteration !== transliteration ||
      formData.notes !== notes ||
      formData.introduction !== introduction,
    [formData, transliteration, notes, introduction],
  )

  const matchesRejectedAttempt = rejectedAttempts.has(
    createAttemptKey(_.pick(formData, editionFields)),
  )

  useEffect(() => {
    const clearRejectedAttempts = () => setRejectedAttempts(new Set())
    window.addEventListener('focus', clearRejectedAttempts)
    return () => window.removeEventListener('focus', clearRejectedAttempts)
  }, [])

  useEffect(() => {
    return () => updatePromise.cancel()
  }, [updatePromise])

  useEffect(() => runBeforeUnloadEvent({ hasChanges }), [hasChanges])

  return (
    <Container fluid>
      <Row>
        <Col>
          <ErrorBoundary>
            <form
              onSubmit={submit}
              id={formId}
              data-testid="transliteration-form"
            >
              <TransliterationFormFields
                formData={formData}
                formId={formId}
                disabled={propsDisabled}
                update={update}
              />
            </form>
          </ErrorBoundary>
        </Col>
      </Row>
      <Row>
        <Col>
          <SubmitButton
            disabled={propsDisabled}
            hasChanges={hasChanges() && !matchesRejectedAttempt}
            formId={formId}
          />
        </Col>
        <Col md="auto">
          <ErrorBoundary>
            <TemplateForm onSubmit={onTemplate} />
          </ErrorBoundary>
        </Col>
      </Row>
    </Container>
  )
}

export default TransliterationForm
