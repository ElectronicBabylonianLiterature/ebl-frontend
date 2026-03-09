import React, {
  useState,
  useEffect,
  FormEvent,
  useCallback,
  useMemo,
} from 'react'
import {
  FormGroup,
  FormLabel,
  Button,
  Container,
  Row,
  Col,
} from 'react-bootstrap'
import _ from 'lodash'
import Promise from 'bluebird'

import Editor from 'editor/Editor'
import SpecialCharactersHelp from 'editor/SpecialCharactersHelp'
import TemplateForm from './TemplateForm'
import { Fragment } from 'fragmentarium/domain/fragment'
import { ErrorBoundary } from '@sentry/react'
import {
  editionFields,
  EditionFields,
} from 'fragmentarium/application/FragmentService'

type Props = {
  transliteration: string
  notes: string
  introduction: string
  updateEdition: (fields: EditionFields) => Promise<Fragment>
  disabled?: boolean
}

type FormData = {
  transliteration: string
  notes: string
  introduction: string
  error: Error | null
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

const SubmitButton = ({
  propsDisabled,
  hasChanges,
  formId,
}: {
  propsDisabled?: boolean
  hasChanges: boolean
  formId: string
}) => (
  <Button
    type="submit"
    variant="primary"
    disabled={propsDisabled || !hasChanges}
    form={formId}
  >
    Save
  </Button>
)

const getFormGroup = ({
  name,
  key,
  value,
  formId,
  propsDisabled,
  update,
  formData,
}: {
  name: 'transliteration' | 'notes' | 'introduction'
  key: number
  value: string
  formId: string
  propsDisabled?: boolean
  update: (property: keyof FormData) => (value: string) => void
  formData: FormData
}): JSX.Element => {
  return (
    <FormGroup controlId={`${formId}-${name}`} key={key}>
      <FormLabel>{_.capitalize(name)}</FormLabel>{' '}
      {name === 'transliteration' && <SpecialCharactersHelp />}
      <Editor
        name={name}
        value={value}
        onChange={update(name)}
        disabled={propsDisabled}
        {...(name === 'transliteration' && { error: formData.error })}
        data-testid={`${name}-form-field`}
      />
    </FormGroup>
  )
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
  const initialValues = useMemo(
    () => ({ transliteration, notes, introduction }),
    [transliteration, notes, introduction],
  )

  const isDirty = (
    _value: unknown,
    field: (typeof editionFields)[number],
  ): boolean => formData[field] !== initialValues[field]

  const update = (property: keyof FormData) => (value: string) => {
    setFormData({
      ...formData,
      [property]: value,
    })
  }

  const onTemplate = (template: string) => {
    setFormData({
      ...formData,
      transliteration: template,
    })
  }

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormData({ ...formData, error: null })
    const updatedFields = _.pickBy(
      _.pick(formData, editionFields),
      isDirty,
    ) as EditionFields
    const promise = updateEdition(updatedFields)
      .then((fragment) => {
        setFormData({
          ...formData,
          transliteration: fragment.atf,
          notes: fragment.notes.text,
          introduction: fragment.introduction.text,
        })
      })
      .catch((error) => {
        setFormData({ ...formData, error })
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
