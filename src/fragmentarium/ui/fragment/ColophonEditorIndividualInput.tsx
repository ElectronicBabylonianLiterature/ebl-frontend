import React from 'react'
import { Form, Row } from 'react-bootstrap'
import { IndividualAttestation, IndividualType } from './ColophonEditor'
import _ from 'lodash'
import ListForm from 'common/List'
import { BrokenAndUncertainSwitches } from 'common/BrokenAndUncertain'
import Select from 'react-select'

export const ColophonIndividualsInput = ({
  searchIndividuals,
  onChange,
  label = 'Individuals',
  collapsed = false,
  individuals = [new IndividualAttestation()],
}: {
  searchIndividuals: (
    query: string
  ) => Promise<ReadonlyArray<IndividualAttestation>>
  onChange
  label?: string
  collapsed?: boolean
  individuals?: ReadonlyArray<IndividualAttestation>
}): JSX.Element => {
  const _individuals =
    individuals.length > 0 ? individuals : [new IndividualAttestation()]
  return (
    <ListForm
      value={_individuals}
      onChange={onChange}
      label={label}
      noun="Individual"
      defaultValue={_individuals}
      collapsed={collapsed}
    >
      {() =>
        _individuals.map((individual, index) => {
          return (
            <IndividualForm
              searchIndividuals={searchIndividuals}
              onChange={onChange}
              individual={individual}
              key={index}
            />
          )
        })
      }
    </ListForm>
  )
}

type IndividualFieldName = 'type' | 'name' | 'sonOf' | 'grandsonOf' | 'family'

const getValueAndOptionsBykey = (
  key: IndividualFieldName,
  individual: IndividualAttestation
): {
  options: readonly { value: string; label: string }[]
  value: { value: string; label: string }
} =>
  key === 'type'
    ? {
        value: { value: individual[key] ?? '', label: individual[key] ?? '' },
        options: Object.values(IndividualType).map((type) => ({
          value: type ?? '',
          label: type ?? '',
        })),
      }
    : {
        value: {
          value: individual[key]?.value ?? '',
          label: individual[key]?.value ?? '',
        },
        options: [],
      }

const IndividualForm = ({
  searchIndividuals,
  onChange,
  individual,
}: {
  searchIndividuals: (
    query: string
  ) => Promise<readonly IndividualAttestation[]>
  onChange
  individual: IndividualAttestation
}): JSX.Element => {
  const individualFields = [
    'type',
    'name',
    'sonOf',
    'grandsonOf',
    'family',
  ].map((key) => (
    <Form.Group key={`${key}-col`}>
      <Form.Label>{_.startCase(key)}</Form.Label>
      <Select
        onChange={onChange}
        isClearable={true}
        key={key}
        placeholder={_.startCase(key)}
        {...getValueAndOptionsBykey(key as IndividualFieldName, individual)}
      />
      {key !== 'type' && (
        <Row key={`${key}-row`}>
          <BrokenAndUncertainSwitches
            key={`${key}-broken-uncertain`}
            name={key}
            {...individual[key]}
          />
        </Row>
      )}
    </Form.Group>
  ))
  return <>{individualFields}</>
}
