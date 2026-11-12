import React, { useEffect, useState } from 'react'
import { Form } from 'react-bootstrap'
import type { MediaMetadata } from 'fragmentarium/application/MediaManagementRepository'

export const emptyMediaMetadata: MediaMetadata = {
  type: 'PHOTO',
  caption: '',
  sourceInstitution: '',
  rightsStatement: '',
  permissionAttested: false,
}

function delimitedItems(value: string): string[] {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

function DelimitedField({
  id,
  label,
  value,
  disabled,
  onChange,
  errorId,
}: {
  id: string
  label: string
  value: string
  disabled: boolean
  onChange: (items: string[]) => void
  errorId?: string
}): JSX.Element {
  const [draft, setDraft] = useState(value)
  useEffect(() => {
    setDraft((current) =>
      delimitedItems(current).join(', ') === value ? current : value,
    )
  }, [value])
  return (
    <Form.Group controlId={id} className="mb-2">
      <Form.Label>{label}</Form.Label>
      <Form.Control
        value={draft}
        disabled={disabled}
        aria-invalid={errorId ? true : undefined}
        aria-describedby={errorId}
        onChange={(event) => {
          const next = event.target.value
          setDraft(next)
          const items = delimitedItems(next)
          if (items.join(', ') !== value) onChange(items)
        }}
        onBlur={() => {
          setDraft(delimitedItems(draft).join(', '))
        }}
      />
    </Form.Group>
  )
}

export default function MediaMetadataFields({
  value,
  onChange,
  id,
  disabled = false,
  rightsEditable = true,
  requiredFields = true,
  legacy = false,
  errorId,
}: {
  value: MediaMetadata
  onChange: (metadata: MediaMetadata) => void
  id: string
  disabled?: boolean
  rightsEditable?: boolean
  requiredFields?: boolean
  legacy?: boolean
  errorId?: string
}): JSX.Element {
  const field = (key: keyof MediaMetadata, label: string, required = false) => (
    <Form.Group controlId={`${id}-${key}`} className="mb-2">
      <Form.Label>{label}</Form.Label>
      <Form.Control
        value={String(value[key] ?? '')}
        required={required && requiredFields}
        maxLength={2000}
        aria-invalid={errorId ? true : undefined}
        aria-describedby={errorId}
        disabled={
          disabled ||
          (!rightsEditable &&
            ['rightsStatement', 'copyrightHolder'].includes(key))
        }
        onChange={(event) => onChange({ ...value, [key]: event.target.value })}
      />
    </Form.Group>
  )
  return (
    <div className="MediaMetadataFields">
      <Form.Group controlId={`${id}-type`} className="mb-2">
        <Form.Label>Image type</Form.Label>
        <Form.Select
          value={value.type}
          disabled={disabled}
          onChange={(event) =>
            onChange({
              ...value,
              type: event.target.value as MediaMetadata['type'],
            })
          }
        >
          <option value="PHOTO">Photograph</option>
          <option value="COPY">Hand copy</option>
        </Form.Select>
      </Form.Group>
      {field('caption', 'Caption or short description', !legacy)}
      {field('attribution', 'Attribution')}
      {field('sourceInstitution', 'Source institution (where applicable)')}
      {field('creator', 'Photographer or creator')}
      {field('copyrightHolder', 'Copyright holder')}
      {field('rightsStatement', 'Rights / reproduction statement', !legacy)}
      {field('description', 'Additional context')}
      <DelimitedField
        id={`${id}-references`}
        label="Bibliography identifiers (comma separated)"
        value={
          value.references?.map((reference) => reference.id).join(', ') ?? ''
        }
        disabled={disabled}
        errorId={errorId}
        onChange={(items) =>
          onChange({ ...value, references: items.map((id) => ({ id })) })
        }
      />
      {!legacy && (
        <DelimitedField
          id={`${id}-projects`}
          label="Research projects (CAIC, ALU_GENEVA, AMPS, RECC; comma separated)"
          value={value.projects?.join(', ') ?? ''}
          disabled={disabled}
          errorId={errorId}
          onChange={(projects) => onChange({ ...value, projects })}
        />
      )}
      {!legacy && (
        <Form.Check
          id={`${id}-permission`}
          type="checkbox"
          required={requiredFields}
          checked={value.permissionAttested}
          disabled={disabled || !rightsEditable}
          label="I am authorized to submit this image under the stated rights."
          onChange={(event) =>
            onChange({ ...value, permissionAttested: event.target.checked })
          }
        />
      )}
    </div>
  )
}
