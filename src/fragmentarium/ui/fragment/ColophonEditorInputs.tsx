import React from 'react'
import { Form, Col, Button, Row } from 'react-bootstrap'
import Select from 'react-select'
import {
  ColophonOwnership,
  ColophonStatus,
  ColophonType,
  Individual,
  IndividualType,
} from './ColophonEditor'
import _ from 'lodash'

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
        isClearable={false}
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
      <Form.Label>Colophon Ownership</Form.Label>
      <Select
        options={options}
        values={[
          {
            value: colophonOwnership ?? '',
            label: colophonOwnership ?? '',
          },
        ]}
        onChange={onChange('colophonOwnership')}
        isClearable={false}
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
      />
    </Form.Group>
  )
}

export const ColophonIndividualsInput = ({
  individuals,
  onChange,
}: {
  individuals: Individual[]
  onChange: (newIndividuals: Individual[]) => void
}): JSX.Element => {
  const handleAddIndividual = () => {
    onChange([
      ...individuals,
      {
        name: { value: '', isBroken: false, isUncertain: false },
        sonOf: { value: '', isBroken: false, isUncertain: false },
        grandsonOf: { value: '', isBroken: false, isUncertain: false },
        family: { value: '', isBroken: false, isUncertain: false },
        nativeOf: undefined,
        type: IndividualType.Owner,
      },
    ])
  }

  const handleRemoveIndividual = (index: number) => {
    const updatedIndividuals = individuals.filter((_, i) => i !== index)
    onChange(updatedIndividuals)
  }

  const updateIndividual = (
    index: number,
    field: keyof Individual,
    key: string,
    value: any
  ): void => {
    const updatedIndividuals = [...individuals]
    const updatedField = { ...updatedIndividuals[index], [key]: value }
    updatedIndividuals[index] = {
      ...updatedIndividuals[index],
      [field]: updatedField,
    }
    onChange(updatedIndividuals)
  }

  return (
    <div>
      {individuals.map((individual, index) => (
        <IndividualInput
          key={index}
          individual={individual}
          onUpdate={(field, key, value) =>
            updateIndividual(index, field, key, value)
          }
          onRemove={() => handleRemoveIndividual(index)}
        />
      ))}
      <Button variant="secondary" onClick={handleAddIndividual}>
        Add Individual
      </Button>
    </div>
  )
}

const IndividualInput = ({
  individual,
  onUpdate,
  onRemove,
}: {
  individual: Individual
  onUpdate: (field: keyof Individual, key: string, value: any) => void
  onRemove: () => void
}): JSX.Element => {
  const inputFields = [
    'type',
    'name',
    'sonOf',
    'grandsonOf',
    'family',
  ].map((key) => (
    <Form.Control
      type="text"
      key={key}
      placeholder={_.startCase(key)}
      value={key === 'type' ? individual.type : individual[key]?.value}
      onChange={(event) =>
        onUpdate(key as keyof Individual, 'value', event.target.value)
      }
    />
  ))
  return (
    <Row>
      <Col>{inputFields}</Col>
      <Col xs="auto">
        <Button variant="danger" onClick={onRemove}>
          Remove
        </Button>
      </Col>
    </Row>
  )
}
