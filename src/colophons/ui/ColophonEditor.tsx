import React, { FormEvent, useState } from 'react'
import { Form, Col, Button, Row } from 'react-bootstrap'
import Select from 'react-select'

import { Provenance } from 'corpus/domain/provenance'
import { Fragment } from 'fragmentarium/domain/fragment'

enum ColophonStatus {
  Yes = 'Yes',
  No = 'No',
  Broken = 'Broken',
  OnlyColophon = 'Only Colophon',
}

enum ColophonType {
  AsbA = 'Asb a',
  AsbB = 'Asb b',
  AsbC = 'Asb c',
  AsbD = 'Asb d',
  AsbE = 'Asb e',
  AsbF = 'Asb f',
  AsbG = 'Asb g', // BAK 321
  AsbH = 'Asb h',
  AsbI = 'Asb i',
  AsbK = 'Asb k',
  AsbL = 'Asb l',
  AsbM = 'Asb m',
  AsbN = 'Asb n',
  AsbO = 'Asb o',
  AsbP = 'Asb p',
  AsbQ = 'Asb q',
  AsbRS = 'Asb r/s',
  AsbT = 'Asb t',
  AsbU = 'Asb u',
  AsbV = 'Asb v',
  AsbW = 'Asb w',
  AsbUnclear = 'Asb Unclear',
  NzkBAK293 = 'Nzk BAK 293',
  NzkBAK294 = 'Nzk BAK 294',
  NzkBAK295 = 'Nzk BAK 295',
  NzkBAK296 = 'Nzk BAK 296',
  NzkBAK297 = 'Nzk BAK 297',
}

enum ColophonOwnership {
  Library = 'Library',
  Private = 'Private',
  Individual = 'Individual',
}

enum IndividualType {
  Owner = 'Owner',
  Scribe = 'Scribe',
  Other = 'Other',
}

interface Name {
  value: string
  isBroken: boolean
  isUncertain: boolean
}

interface Individual {
  name?: Name
  sonOf?: Name
  grandsonOf?: Name
  family?: Name
  nativeOf?: Provenance
  type?: IndividualType
}

export interface Colophon {
  colophonStatus: ColophonStatus
  colophonOwnership?: ColophonOwnership
  colophonType?: ColophonType
  originalFrom?: Provenance
  writtenIn?: Provenance
  notesToScribalProcess?: string
  individuals?: Individual[]
}

interface Props {
  fragment: Fragment
  updateColophon: (colophon: Colophon) => Promise<void>
  disabled?: boolean
}

const ColophonStatusInput = ({
  colophonStatus,
  onChange,
}: {
  colophonStatus: ColophonStatus
  onChange
}) => {
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

const ColophonOwnershipInput = ({
  colophonOwnership,
  onChange,
}: {
  colophonOwnership?: ColophonOwnership
  onChange
}) => {
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

const ColophonTypeInput = ({
  colophonType,
  onChange,
}: {
  colophonType?: ColophonType
  onChange
}) => {
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

const ColophonIndividualsInput = ({
  individuals,
  onChange,
}: {
  individuals: Individual[]
  onChange: (newIndividuals: Individual[]) => void
}) => {
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
  ) => {
    console.log(index, field, key, value)
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
}) => {
  return (
    <Row>
      <Col>
        <Form.Control
          type="text"
          placeholder="Type"
          value={individual.type}
          onChange={(e) => onUpdate('family', 'value', e.target.value)}
        />
        <Form.Control
          type="text"
          placeholder="Name"
          value={individual.name?.value ?? ''}
          onChange={(e) => onUpdate('name', 'value', e.target.value)}
        />
        <Form.Control
          type="text"
          placeholder="Son of"
          value={individual.sonOf?.value}
          onChange={(e) => onUpdate('sonOf', 'value', e.target.value)}
        />
        <Form.Control
          type="text"
          placeholder="Grandson of"
          value={individual.grandsonOf?.value}
          onChange={(e) => onUpdate('grandsonOf', 'value', e.target.value)}
        />
        <Form.Control
          type="text"
          placeholder="Family"
          value={individual.family?.value}
          onChange={(e) => onUpdate('family', 'value', e.target.value)}
        />
      </Col>
      <Col xs="auto">
        <Button variant="danger" onClick={onRemove}>
          Remove
        </Button>
      </Col>
    </Row>
  )
}

const ColophonEditor: React.FC<Props> = ({
  fragment,
  disabled,
  updateColophon,
}) => {
  // ToDo: Implement commented out
  //const { colophon } = fragment
  const [formData, setFormData] = useState<Colophon>({
    colophonStatus: ColophonStatus.No, //colophon?.colophonStatus || ColophonStatus.No,
    colophonOwnership: ColophonOwnership.Library, //fragment.colophon?.colophonOwnership || ColophonOwnership.Library,
    colophonType: ColophonType.AsbA, //fragment.colophon?.colophonType,
    originalFrom: undefined, //colophon?.originalFrom,
    writtenIn: undefined, //colophon?.writtenIn,
    notesToScribalProcess: undefined, //colophon?.notesToScribalProcess,
    individuals: [], //colophon?.individuals,
  })
  const [error, setError] = useState<Error | null>(null)

  /*
  const handleInputChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }))
  }
  */

  const handleSelectChange = (name: string) => (selectedOption: any) => {
    setFormData((prevState) => ({
      ...prevState,
      [name]: selectedOption?.value,
    }))
  }

  const submit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()
    try {
      await updateColophon(formData)
    } catch (error) {
      setError(error as Error)
    }
  }

  return (
    <Form onSubmit={submit}>
      <Row>
        <ColophonStatusInput
          colophonStatus={formData.colophonStatus}
          onChange={handleSelectChange}
        />
      </Row>
      <Row>
        <ColophonOwnershipInput
          colophonOwnership={formData.colophonOwnership}
          onChange={handleSelectChange}
        />
      </Row>
      <Row>
        <ColophonTypeInput
          colophonType={formData.colophonType}
          onChange={handleSelectChange('colophonType')}
        />
      </Row>
      <Row>
        <ColophonIndividualsInput
          individuals={formData.individuals ?? []}
          onChange={handleSelectChange('colophonType')}
        />
      </Row>
      <Button
        variant="primary"
        type="submit"
        disabled={disabled || error !== null}
      >
        Save
      </Button>
    </Form>
  )
}

export default ColophonEditor
