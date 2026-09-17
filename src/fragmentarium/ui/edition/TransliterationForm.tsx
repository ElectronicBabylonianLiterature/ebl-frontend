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
import SupersedableOperation from 'common/utils/SupersedableOperation'
import applyWhenCurrent from 'common/utils/applyWhenCurrent'
import { runBeforeUnloadEvent } from 'fragmentarium/ui/edition/beforeUnloadWarning'

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
  const updateOperation = useRef(new SupersedableOperation())
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
    const updatedFields = _.pickBy(
      _.pick(formData, editionFields),
      isDirty,
    ) as EditionFields
    applyWhenCurrent(() => updateEdition(updatedFields), {
      onSuccess: (fragment: Fragment) => {
        setFormData((prev) => ({
          ...prev,
          transliteration: fragment.atf,
          notes: fragment.notes.text,
          introduction: fragment.introduction.text,
          error: null,
        }))
      },
      onError: (error) => {
        setFormData((prev) => ({ ...prev, error }))
      },
    })(updateOperation.current.start())
  }

  const hasChanges = useCallback(
    (): boolean =>
      formData.transliteration !== transliteration ||
      formData.notes !== notes ||
      formData.introduction !== introduction,
    [formData, transliteration, notes, introduction],
  )

  useEffect(() => () => updateOperation.current.supersede(), [])

  useEffect(() => {
    return runBeforeUnloadEvent({ hasChanges })
  }, [formData, transliteration, notes, introduction, hasChanges])

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
