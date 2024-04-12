import React from 'react'
import { Form, Col, Row } from 'react-bootstrap'
import Select from 'react-select'
import {
  Colophon,
  ColophonOwnership,
  ColophonStatus,
  ColophonType,
} from './ColophonEditor'
import _ from 'lodash'
import ProvenanceSearchForm from '../ProvenanceSearchForm'
import FragmentService from 'fragmentarium/application/FragmentService'
import { BrokenAndUncertainSwitches } from 'common/BrokenAndUncertain'
import { Provenances } from 'corpus/domain/provenance'

export const ProvenanceAttestationInput = ({
  fieldName,
  onChange,
  fragmentService,
  colophon,
}: {
  fieldName: 'originalFrom' | 'writtenIn'
  onChange: (field: keyof Colophon, value: any) => void
  fragmentService: FragmentService
  colophon: Colophon
}): JSX.Element => {
  const provenanceAttestation = colophon[fieldName]
  return (
    <Form.Group as={Col}>
      <Form.Label>{_.startCase(fieldName)}</Form.Label>
      <ProvenanceSearchForm
        fragmentService={fragmentService}
        onChange={(value) => {
          console.log('VALUE', value, [value?.split(' (')[0].trim() ?? value])
          // ToDo: fix for values without brackets (i.e. `Assyria`)
          // Better reconsider architecture
          onChange(fieldName, {
            ...provenanceAttestation,
            value: value
              ? Provenances[value.split(' (')[0].trim() ?? value]
              : null,
          })
        }}
        value={provenanceAttestation?.value?.name ?? null}
        placeholder={_.startCase(fieldName)}
      />
      <Row>
        <BrokenAndUncertainSwitches
          name={fieldName}
          {...{
            ...provenanceAttestation,
            setBroken: (isBroken: boolean) => {
              onChange(fieldName, { ...provenanceAttestation, isBroken })
            },
            setUncertain: (isUncertain: boolean) => {
              onChange(fieldName, { ...provenanceAttestation, isUncertain })
            },
          }}
        />
      </Row>
    </Form.Group>
  )
}

export const ColophonStatusInput = ({
  colophonStatus,
  onChange,
}: {
  colophonStatus?: ColophonStatus
  onChange: (field: keyof Colophon, value: any) => void
}): JSX.Element => {
  const options = Object.values(ColophonStatus).map((status) => ({
    value: status,
    label: status,
  }))
  return (
    <Form.Group as={Col}>
      <Form.Label>Colophon Status</Form.Label>
      <Select
        options={options}
        {...(colophonStatus && {
          value: { value: colophonStatus, label: colophonStatus },
        })}
        onChange={(option) => onChange('colophonStatus', option?.value)}
        isClearable={true}
        placeholder="Status"
      />
    </Form.Group>
  )
}

export const ColophonOwnershipInput = ({
  colophonOwnership,
  onChange,
}: {
  colophonOwnership?: ColophonOwnership
  onChange: (field: keyof Colophon, value: any) => void
}): JSX.Element => {
  const options = Object.values(ColophonOwnership).map((ownership) => ({
    value: ownership,
    label: ownership,
  }))
  return (
    <Form.Group as={Col}>
      <Form.Label>Ownership</Form.Label>
      <Select
        options={options}
        values={[
          {
            value: colophonOwnership ?? '',
            label: colophonOwnership ?? '',
          },
        ]}
        onChange={(option) => onChange('colophonOwnership', option?.value)}
        isClearable={true}
        placeholder="Ownership"
      />
    </Form.Group>
  )
}

export const ColophonTypeInput = ({
  colophonTypes,
  onChange,
}: {
  colophonTypes?: ColophonType[]
  onChange: (field: keyof Colophon, value: any) => void
}): JSX.Element => {
  const options = Object.values(ColophonType).map((type) => ({
    value: type,
    label: type,
  }))
  return (
    <Form.Group as={Col}>
      <Form.Label>Colophon Type</Form.Label>
      <Select
        options={options}
        values={[{ value: colophonTypes ?? '', label: colophonTypes ?? '' }]}
        onChange={(option) => onChange('colophonTypes', option?.values)}
        isClearable={true}
        placeholder="Type"
        isMulti={true}
      />
    </Form.Group>
  )
}

export const ColophonNotesToScribalProcessInput = ({
  notesToScribalProcess,
  onChange,
}: {
  notesToScribalProcess?: string
  onChange: (field: keyof Colophon, value: any) => void
}): JSX.Element => {
  return (
    <Form.Group as={Col}>
      <Form.Label>Notes To Scribal Process</Form.Label>
      <Form.Control
        as="textarea"
        onChange={(event) =>
          onChange('notesToScribalProcess', event.target.value)
        }
        value={notesToScribalProcess}
      />
    </Form.Group>
  )
}
