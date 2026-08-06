import React from 'react'
import { Button, FormGroup, FormLabel } from 'react-bootstrap'
import _ from 'lodash'
import Editor from 'editor/Editor'
import SpecialCharactersHelp from 'editor/SpecialCharactersHelp'

export type FormData = {
  transliteration: string
  notes: string
  introduction: string
  error: Error | null
  disabled?: boolean
}

export const handleBeforeUnload = (
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

export const runBeforeUnloadEvent = ({
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

export const SubmitButton = ({
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

export const getFormGroup = ({
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
