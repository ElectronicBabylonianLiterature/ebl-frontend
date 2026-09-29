import React from 'react'
import { Button, FormGroup, FormLabel } from 'react-bootstrap'
import _ from 'lodash'
import Editor from 'editor/Editor'
import SpecialCharactersHelp from 'editor/SpecialCharactersHelp'
import { editionFields } from 'fragmentarium/application/FragmentService'

export type FormData = {
  transliteration: string
  notes: string
  introduction: string
  error: Error | null
  disabled?: boolean
}

export function SubmitButton({
  disabled,
  hasChanges,
  formId,
}: {
  disabled?: boolean
  hasChanges: boolean
  formId: string
}): JSX.Element {
  return (
    <Button
      type="submit"
      variant="primary"
      disabled={disabled || !hasChanges}
      form={formId}
    >
      Save
    </Button>
  )
}

export function TransliterationFormFields({
  formData,
  formId,
  disabled,
  update,
}: {
  formData: FormData
  formId: string
  disabled?: boolean
  update: (property: keyof FormData) => (value: string) => void
}): JSX.Element {
  return (
    <>
      {editionFields.map((name) => (
        <FormGroup controlId={`${formId}-${name}`} key={name}>
          <FormLabel>{_.capitalize(name)}</FormLabel>{' '}
          {name === 'transliteration' && <SpecialCharactersHelp />}
          <Editor
            name={name}
            value={formData[name]}
            onChange={update(name)}
            disabled={disabled}
            {...(name === 'transliteration' && { error: formData.error })}
            data-testid={`${name}-form-field`}
          />
        </FormGroup>
      ))}
    </>
  )
}
