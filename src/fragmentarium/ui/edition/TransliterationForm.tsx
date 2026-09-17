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

import TemplateForm from './TemplateForm'
import { Fragment } from 'fragmentarium/domain/fragment'
import { ErrorBoundary } from '@sentry/react'
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

const isValidationError = (error: unknown): boolean =>
  !_.isEmpty(_.get(error, 'data.errors'))

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
  updatePromise,
}: {
  hasChanges: () => boolean
  updatePromise: Promise<void>
}) => {
  const _handleBeforeEvent = (event) => handleBeforeUnload(event, hasChanges)
  if (hasChanges()) {
    window.addEventListener('beforeunload', _handleBeforeEvent)
  } else {
    window.removeEventListener('beforeunload', _handleBeforeEvent)
  }
  return () => {
    window.removeEventListener('beforeunload', _handleBeforeEvent)
    updatePromise.cancel()
  }
}

const TransliterationForm: React.FC<Props> = ({
  transliteration,
  notes,
  introduction,
  updateEdition,
  disabled: propsDisabled,
}): JSX.Element => {
  const formId = _.uniqueId('TransliterationForm-')
  const [formData, setFormData] = useState<FormData>({
    transliteration,
    notes,
    introduction,
    error: null,
    disabled: false,
  })
  const [updatePromise, setUpdatePromise] = useState(Promise.resolve())
  const [lastAttempt, setLastAttempt] = useState<EditedValues | null>(null)
  const initialValues = useMemo(
    () => ({ transliteration, notes, introduction }),
    [transliteration, notes, introduction],
  )

  const isDirty = (
    _value: unknown,
    field: (typeof editionFields)[number],
  ): boolean => formData[field] !== initialValues[field]

  const update = (property: keyof FormData) => (value: string) => {
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
    const editedValues = _.pick(formData, editionFields) as EditedValues
    const updatedFields = _.pickBy(editedValues, isDirty) as EditionFields
    const promise = updateEdition(updatedFields)
      .then((fragment) => {
        setLastAttempt(null)
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
        if (isValidationError(error)) {
          setLastAttempt(editedValues)
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

  const matchesLastAttempt =
    lastAttempt !== null &&
    _.isEqual(_.pick(formData, editionFields), lastAttempt)

  useEffect(() => {
    return runBeforeUnloadEvent({ hasChanges, updatePromise })
  }, [
    formData,
    transliteration,
    notes,
    introduction,
    updatePromise,
    hasChanges,
  ])

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
            hasChanges={hasChanges() && !matchesLastAttempt}
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
