import React, { ChangeEvent } from 'react'
import _ from 'lodash'
import { Form, Col } from 'react-bootstrap'
import Select from 'react-select'
import type { SingleValue } from 'react-select'

export type SiteOption = { value: string; label: string }

export interface FindspotOption {
  value: number | null
  label: string | null
}

export function ExcavationNumberField({
  value,
  onChange,
}: {
  value: string
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
}): JSX.Element {
  return (
    <Form.Group as={Col} controlId={_.uniqueId('excavationNumber-')}>
      <Form.Label>Excavation number</Form.Label>
      <Form.Control type="text" value={value} onChange={onChange} />
    </Form.Group>
  )
}

export function ExcavationSiteField({
  site,
  options,
  onChange,
}: {
  site: string
  options: SiteOption[]
  onChange: (event: SingleValue<SiteOption>) => void
}): JSX.Element {
  return (
    <Form.Group as={Col} controlId={_.uniqueId('excavationSite-')}>
      <Form.Label>Excavation site</Form.Label>
      <Select<SiteOption, false>
        aria-label="select-site"
        options={options}
        value={
          options.find((option) => option.value === site) || {
            value: site,
            label: site,
          }
        }
        onChange={onChange}
        isSearchable={true}
        isClearable
      />
    </Form.Group>
  )
}

interface CheckboxFieldProps {
  checked: boolean
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
}

function CheckboxField({
  groupIdPrefix,
  checkboxIdPrefix,
  label,
  ariaLabel,
  checked,
  onChange,
}: CheckboxFieldProps & {
  groupIdPrefix: string
  checkboxIdPrefix: string
  label: string
  ariaLabel: string
}): JSX.Element {
  return (
    <Form.Group as={Col} controlId={_.uniqueId(groupIdPrefix)}>
      <Form.Check
        type="checkbox"
        id={_.uniqueId(checkboxIdPrefix)}
        label={label}
        aria-label={ariaLabel}
        checked={checked}
        onChange={onChange}
      />
    </Form.Group>
  )
}

export function RegularExcavationField(props: CheckboxFieldProps): JSX.Element {
  return (
    <CheckboxField
      {...props}
      groupIdPrefix="regularExcavationSite-"
      checkboxIdPrefix="isRegularExcavation-"
      label="Regular Excavation"
      ariaLabel="regular-excavation"
    />
  )
}

export function FindspotField({
  findspotId,
  findspotLabel,
  options,
  onChange,
}: {
  findspotId: number | null
  findspotLabel: string | null
  options: FindspotOption[]
  onChange: (event: SingleValue<FindspotOption>) => void
}): JSX.Element {
  return (
    <Form.Group as={Col} controlId={_.uniqueId('findspot-')}>
      <Form.Label>Findspot</Form.Label>
      <Select<FindspotOption, false>
        aria-label="select-findspot"
        options={options}
        value={{
          value: findspotId,
          label: findspotLabel,
        }}
        onChange={onChange}
        isSearchable={true}
        isClearable
      />
    </Form.Group>
  )
}

export function FindspotUncertainField(props: CheckboxFieldProps): JSX.Element {
  return (
    <CheckboxField
      {...props}
      groupIdPrefix="isFindspotUncertain-"
      checkboxIdPrefix="isFindspotUncertain-"
      label="Findspot uncertain"
      ariaLabel="findspot-uncertain"
    />
  )
}
