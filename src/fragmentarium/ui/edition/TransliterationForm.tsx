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
import {
  FormData,
  SubmitButton,
  TransliterationFormFields,
} from 'fragmentarium/ui/edition/TransliterationFormControls'
import SupersedableOperation from 'common/utils/SupersedableOperation'
import applyWhenCurrent from 'common/utils/applyWhenCurrent'
import {
  createAttemptKey,
  createUpdatedFields,
  rememberRejectedAttempt,
  isDeterministicFailure,
  mergeSavedValues,
} from 'fragmentarium/ui/edition/rejectedEditionAttempts'
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
  const formId = useMemo(() => _.uniqueId('TransliterationForm-'), [])
  const [formData, setFormData] = useState<FormData>({
    transliteration,
    notes,
    introduction,
    error: null,
    disabled: false,
  })
  const [rejectedAttempts, setRejectedAttempts] = useState<ReadonlySet<string>>(
    new Set(),
  )
  const updateOperation = useRef(new SupersedableOperation())
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
    if (rejectedAttempts.has(createAttemptKey(editedValues))) {
      return
    }
    const updatedFields = createUpdatedFields(editedValues, initialValues)
    applyWhenCurrent(() => updateEdition(updatedFields), {
      onSuccess: (fragment: Fragment) => {
        setRejectedAttempts(new Set())
        setFormData((prev) => ({
          ...prev,
          ...mergeSavedValues(prev, editedValues, {
            transliteration: fragment.atf,
            notes: fragment.notes.text,
            introduction: fragment.introduction.text,
          }),
          error: null,
        }))
      },
      onError: (error) => {
        if (isDeterministicFailure(error)) {
          setRejectedAttempts((previousAttempts) =>
            rememberRejectedAttempt(
              previousAttempts,
              createAttemptKey(editedValues),
            ),
          )
        }
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

  const matchesRejectedAttempt = rejectedAttempts.has(
    createAttemptKey(formData),
  )

  useEffect(() => {
    const clearRejectedAttempts = () => setRejectedAttempts(new Set<string>())
    window.addEventListener('focus', clearRejectedAttempts)
    return () => window.removeEventListener('focus', clearRejectedAttempts)
  }, [])

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
