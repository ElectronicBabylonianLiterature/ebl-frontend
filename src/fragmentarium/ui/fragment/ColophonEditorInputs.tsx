import React from 'react'
import { Form, Col, Row } from 'react-bootstrap'
import Select from 'react-select'
import {
  ColophonOwnership,
  ColophonStatus,
  ColophonType,
  ProvenanceAttestation,
} from './ColophonEditor'
import _ from 'lodash'
import ProvenanceSearchForm from '../ProvenanceSearchForm'
import FragmentService from 'fragmentarium/application/FragmentService'
import { BrokenAndUncertainSwitches } from 'common/BrokenAndUncertain'

const ProvenanceAttestationInput = ({
  provenanceAttestation,
  name,
  onChange,
  fragmentService,
  setBroken,
  setUncertain,
}: {
  provenanceAttestation?: ProvenanceAttestation
  name: string
  onChange
  fragmentService: FragmentService
  setBroken: (any) => void
  setUncertain: (any) => void
}): JSX.Element => {
  return (
    <Form.Group as={Col}>
      <Form.Label>{_.startCase(name)}</Form.Label>
      <ProvenanceSearchForm
        fragmentService={fragmentService}
        onChange={onChange}
        value={provenanceAttestation?.value?.name}
        placeholder={_.startCase(name)}
      />
      <Row>
        <BrokenAndUncertainSwitches
          name={name}
          {...{ ...provenanceAttestation, setBroken, setUncertain }}
        />
      </Row>
    </Form.Group>
  )
}

export const ColophonStatusInput = ({
  colophonStatus,
  onChange,
}: {
  colophonStatus: ColophonStatus
  onChange
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
        value={{ value: colophonStatus, label: colophonStatus }}
        onChange={onChange('colophonStatus')}
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
  onChange
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
        onChange={onChange('colophonOwnership')}
        isClearable={true}
        placeholder="Ownership"
      />
    </Form.Group>
  )
}

export const ColophonTypeInput = ({
  colophonType,
  onChange,
}: {
  colophonType?: ColophonType
  onChange
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
        values={[{ value: colophonType ?? '', label: colophonType ?? '' }]}
        onChange={onChange}
        isClearable={true}
        placeholder="Type"
      />
    </Form.Group>
  )
}

export const ColophonOriginalFromInput = ({
  originalFrom,
  onChange,
  fragmentService,
}: {
  originalFrom?: ProvenanceAttestation
  onChange
  fragmentService: FragmentService
}): JSX.Element => {
  const setBroken = (event) => {
    console.log(event)
  }
  const setUncertain = setBroken
  return (
    <ProvenanceAttestationInput
      {...{
        ...originalFrom,
        onChange,
        fragmentService,
        setBroken,
        setUncertain,
        name: 'originalFrom',
        placeholder: 'Ownership',
      }}
    />
  )
}

export const ColophonWrittenInInput = ({
  writtenIn,
  onChange,
  fragmentService,
}: {
  writtenIn?: ProvenanceAttestation
  onChange
  fragmentService: FragmentService
}): JSX.Element => {
  const setBroken = (event) => {
    console.log(event)
  }
  const setUncertain = setBroken
  return (
    <ProvenanceAttestationInput
      {...{
        ...writtenIn,
        onChange,
        fragmentService,
        setBroken,
        setUncertain,
        name: 'writtenIn',
      }}
    />
  )
}
