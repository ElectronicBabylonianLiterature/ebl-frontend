import React, {
  useState,
  useEffect,
  useRef,
  FormEvent,
  useCallback,
  useMemo,
} from 'react'
import { Container, Row, Col } from 'react-bootstrap'
import _ from 'lodash'

import TemplateForm from 'fragmentarium/ui/edition/TemplateForm'
import { Fragment } from 'fragmentarium/domain/fragment'
import { ErrorBoundary } from '@sentry/react'
import {
  editionFields,
  EditionFields,
} from 'fragmentarium/application/FragmentService'
import AbortableOperation from 'common/utils/AbortableOperation'
import {
  FormData,
  getFormGroup,
  runBeforeUnloadEvent,
  SubmitButton,
} from 'fragmentarium/ui/edition/TransliterationFormFields'

type Props = {
  transliteration: string
  notes: string
  introduction: string
  updateEdition: (fields: EditionFields) => Promise<Fragment>
  disabled?: boolean
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
  const updateOperation = useRef(new AbortableOperation())
  useEffect(() => () => updateOperation.current.abort(), [])
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
      error: null,
    }))
  }

  const onTemplate = (template: string) => {
    setFormData((prev) => ({
      ...prev,
      transliteration: template,
      error: null,
    }))
  }

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormData((prev) => ({ ...prev, error: null }))
    const updatedFields = _.pickBy(
      _.pick(formData, editionFields),
      isDirty,
    ) as EditionFields
    const signal = updateOperation.current.start()
    updateEdition(updatedFields)
      .then((fragment) => {
        if (!signal.aborted) {
          setFormData((prev) => ({
            ...prev,
            transliteration: fragment.atf,
            notes: fragment.notes.text,
            introduction: fragment.introduction.text,
            error: null,
          }))
        }
      })
      .catch((error) => {
        if (!signal.aborted) {
          setFormData((prev) => ({ ...prev, error }))
        }
      })
  }

  const hasChanges = useCallback(
    (): boolean =>
      formData.transliteration !== transliteration ||
      formData.notes !== notes ||
      formData.introduction !== introduction,
    [formData, transliteration, notes, introduction],
  )

  useEffect(() => {
    return runBeforeUnloadEvent({ hasChanges })
  }, [formData, transliteration, notes, introduction, hasChanges])

  const formGroups = editionFields.map(
    (name, key: number): JSX.Element =>
      getFormGroup({
        name,
        key,
        value: formData[name],
        formId,
        propsDisabled,
        update,
        formData,
      }),
  )

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
              {formGroups}
            </form>
          </ErrorBoundary>
        </Col>
      </Row>
      <Row>
        <Col>
          <SubmitButton
            propsDisabled={propsDisabled}
            hasChanges={hasChanges()}
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
